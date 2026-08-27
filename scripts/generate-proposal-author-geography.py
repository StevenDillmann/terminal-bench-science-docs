#!/usr/bin/env python3
"""Generate light and dark maps of Terminal-Bench-Science proposal authors."""

from __future__ import annotations

import base64
import concurrent.futures
import json
import math
import os
import re
import subprocess
import tempfile
import time
import tomllib
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Iterable
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.patches import PathPatch
from matplotlib.path import Path as MplPath
from PIL import Image

DASHBOARD_DATA_URL = (
    "https://raw.githubusercontent.com/StevenDillmann/"
    "tb-science-task-dashboard/main/public/data.json"
)
LAND_DATA_URL = (
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/"
    "v5.1.2/geojson/ne_110m_land.geojson"
)
USER_AGENT = "terminal-bench-science-contributor-map/1.0"
EARTH_RADIUS_KM = 6371.0088
MAP_LATITUDE_LIMITS = (-60.0, 85.0)
ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public"
CACHE_DIR = Path(tempfile.gettempdir()) / "tb-science-proposal-author-map"

# Land fill/coast follow the site's `muted` / `border` tokens so the map sits on
# the page background (the ocean is transparent) with continents still readable.
THEMES = {
    "light": {
        "land": "#f4f4f5",
        "coast": "#e4e4e7",
        "density": ["#b9e3e6", "#6cc6cb", "#2aa4ab", "#038f99"],
    },
    "dark": {
        "land": "#27272a",
        "coast": "#3f3f46",
        "density": ["#1f6f75", "#1f9aa2", "#3fc3ca", "#a6ecef"],
    },
}
# Gamma applied to normalised density before colouring; higher keeps sparse
# regions faint instead of flattening everything toward full intensity.
DENSITY_GAMMA = 0.36
DENSITY_MAX_ALPHA = 0.84


def fetch_json(url: str, *, headers: dict[str, str] | None = None) -> object:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, **(headers or {})},
    )
    for attempt in range(5):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except urllib.error.HTTPError:
            raise
        except (OSError, TimeoutError, urllib.error.URLError):
            if attempt == 4:
                raise
            time.sleep(1.5 * 2**attempt)
    raise RuntimeError(f"Failed to fetch {url}")


def github_token() -> str:
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if token:
        return token
    return subprocess.check_output(["gh", "auth", "token"], text=True).strip()


def proposal_logins(dashboard: dict[str, object]) -> list[str]:
    logins: dict[str, str] = {}
    for proposal in dashboard["proposals"]:
        discussion_author = proposal.get("author")
        if discussion_author and discussion_author.get("login"):
            login = discussion_author["login"]
            logins.setdefault(login.casefold(), login)

        match = re.search(
            r"^\*\*GitHub(?: Usernames?)?:\*\*\s*(.+)$",
            proposal.get("body", ""),
            re.IGNORECASE | re.MULTILINE,
        )
        if not match:
            continue
        for raw_login in re.split(
            r"\s*(?:[;,；，]|\band\b|&)\s*", match.group(1), flags=re.IGNORECASE
        ):
            login = raw_login.strip().rstrip("/").split("/")[-1].lstrip("@").strip()
            if (
                not login
                or login.casefold() in {"none", "none provided", "n/a", "na"}
                or " " in login
            ):
                continue
            logins.setdefault(login.casefold(), login)

    return sorted(logins.values(), key=str.casefold)


def split_people(value: str) -> list[str]:
    return [
        item.strip().rstrip("/").split("/")[-1].lstrip("@").strip()
        for item in re.split(
            r"\s*(?:[;,；，]|\band\b|&)\s*", value, flags=re.IGNORECASE
        )
        if item.strip()
    ]


def proposal_author_names(dashboard: dict[str, object]) -> dict[str, str]:
    names_by_login: dict[str, str] = {}
    for proposal in dashboard["proposals"]:
        body = proposal.get("body", "")
        author_match = re.search(
            r"^\*\*Author(?:s)?(?: Names?)?:\*\*\s*(.+)$",
            body,
            re.IGNORECASE | re.MULTILINE,
        )
        github_match = re.search(
            r"^\*\*GitHub(?: Usernames?)?:\*\*\s*(.+)$",
            body,
            re.IGNORECASE | re.MULTILINE,
        )
        if not author_match:
            continue
        names = split_people(author_match.group(1))
        github_logins = split_people(github_match.group(1)) if github_match else []
        for name, login in zip(names, github_logins, strict=False):
            if login.casefold() not in {"none", "none provided", "n/a", "na"}:
                names_by_login.setdefault(login.casefold(), name)

        discussion_author = proposal.get("author")
        if names and discussion_author and discussion_author.get("login"):
            names_by_login.setdefault(
                discussion_author["login"].casefold(),
                names[0],
            )
    return names_by_login


def fetch_profile(login: str, token: str) -> dict[str, object]:
    try:
        profile = fetch_json(
            f"https://api.github.com/users/{urllib.parse.quote(login)}",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
            },
        )
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return {"login": login, "missing": True}
        raise
    return {
        "login": profile.get("login", login),
        "name": profile.get("name"),
        "location": profile.get("location"),
        "company": profile.get("company"),
    }


def fetch_profiles(logins: list[str], token: str) -> list[dict[str, object]]:
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        return list(executor.map(lambda login: fetch_profile(login, token), logins))


def as_list(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if value is None:
        return []
    text = str(value).strip()
    return [text] if text else []


def fetch_pr_task_authors(
    pull_request: dict[str, object], token: str
) -> list[dict[str, object]]:
    task_dir = pull_request.get("task_dir")
    task_files = pull_request.get("task_files") or []
    if not task_dir or "task.toml" not in task_files:
        return []

    path = urllib.parse.quote(f"{task_dir}/task.toml", safe="/")
    url = (
        "https://api.github.com/repos/harbor-framework/terminal-bench-science/"
        f"contents/{path}?ref={pull_request['head_sha']}"
    )
    try:
        response = fetch_json(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
            },
        )
    except urllib.error.HTTPError as error:
        if error.code in {404, 409, 422}:
            return []
        raise

    content = base64.b64decode(response["content"]).decode()
    task = tomllib.loads(content)
    metadata = task.get("metadata", {})
    names = as_list(metadata.get("author_name"))
    organizations = as_list(metadata.get("author_organization"))
    if not names:
        names = [
            str(author.get("name", "")).strip()
            for author in task.get("task", {}).get("authors", [])
            if str(author.get("name", "")).strip()
        ]

    records = []
    for index, name in enumerate(names):
        organization = (
            organizations[index]
            if index < len(organizations)
            else organizations[0]
            if len(organizations) == 1
            else ""
        )
        records.append(
            {
                "name": name,
                "company": organization,
                "source": "task_pr",
            }
        )
    return records


def fetch_pr_authors(
    dashboard: dict[str, object], token: str
) -> list[dict[str, object]]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = CACHE_DIR / "pr-authors.json"
    if cache_path.exists():
        return json.loads(cache_path.read_text())

    pull_requests = dashboard.get("prs", [])
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        nested = executor.map(
            lambda pull_request: fetch_pr_task_authors(pull_request, token),
            pull_requests,
        )
    authors = [author for author_group in nested for author in author_group]
    cache_path.write_text(json.dumps(authors, indent=2))
    return authors


def normalized_person(name: str) -> str:
    decomposed = unicodedata.normalize("NFKD", name)
    return "".join(character for character in decomposed if character.isalnum()).casefold()


def combine_authors(
    proposal_profiles: list[dict[str, object]],
    pr_authors: list[dict[str, object]],
) -> list[dict[str, object]]:
    combined: dict[str, dict[str, object]] = {}
    for profile in proposal_profiles:
        identity = normalized_person(
            str(profile.get("name") or profile.get("login") or "")
        )
        if identity:
            combined[identity] = profile

    for author in pr_authors:
        identity = normalized_person(str(author.get("name") or ""))
        if not identity:
            continue
        existing = combined.get(identity)
        if existing:
            if author.get("company"):
                combined[identity] = {**existing, "company": author["company"]}
        else:
            combined[identity] = author
    return list(combined.values())


def geocode(location: str) -> dict[str, object] | None:
    query = urllib.parse.urlencode(
        {"q": location, "format": "jsonv2", "limit": 1, "addressdetails": 0}
    )
    results = fetch_json(f"https://nominatim.openstreetmap.org/search?{query}")
    if not results:
        return None
    result = results[0]
    return {
        "latitude": float(result["lat"]),
        "longitude": float(result["lon"]),
        "display_name": result["display_name"],
    }


def geocode_profiles(
    profiles: list[dict[str, object]],
) -> tuple[list[dict[str, object]], int]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = CACHE_DIR / "geocodes.json"
    cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}
    broad_locations = {
        "canada",
        "china",
        "emea",
        "germany",
        "india",
        "israel",
        "poland",
        "saudi arabia (sa)",
        "switzerland",
        "united states",
        "usa",
    }

    def query_for(profile: dict[str, object]) -> str:
        location = str(profile.get("location") or "").strip()
        company = re.sub(
            r"^@|https?://|/$", "", str(profile.get("company") or "").strip()
        )
        if company and (not location or location.casefold() in broad_locations):
            return company
        return location

    queries = sorted(
        {query_for(profile) for profile in profiles if query_for(profile)},
        key=str.casefold,
    )

    for query in queries:
        if query in cache:
            continue
        try:
            cache[query] = geocode(query)
        except (TimeoutError, urllib.error.URLError):
            cache[query] = None
        cache_path.write_text(json.dumps(cache, indent=2, sort_keys=True))
        time.sleep(1.05)

    points = []
    for profile in profiles:
        query = query_for(profile)
        coordinates = cache.get(query)
        if not coordinates:
            continue
        points.append({**profile, "geocoding_query": query, **coordinates})
    return points, len(queries)


def polygon_path(rings: list[list[list[float]]]) -> MplPath:
    vertices: list[tuple[float, float]] = []
    codes: list[int] = []
    for ring in rings:
        if len(ring) < 3:
            continue
        vertices.extend((float(lon), float(lat)) for lon, lat, *_ in ring)
        codes.extend(
            [MplPath.MOVETO, *([MplPath.LINETO] * (len(ring) - 2)), MplPath.CLOSEPOLY]
        )
    return MplPath(vertices, codes)


def load_land_paths() -> list[MplPath]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = CACHE_DIR / "ne_110m_land.geojson"
    if not path.exists():
        request = urllib.request.Request(
            LAND_DATA_URL, headers={"User-Agent": USER_AGENT}
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            path.write_bytes(response.read())
    geojson = json.loads(path.read_text())
    paths = []
    for feature in geojson["features"]:
        geometry = feature["geometry"]
        if geometry["type"] == "Polygon":
            paths.append(polygon_path(geometry["coordinates"]))
        elif geometry["type"] == "MultiPolygon":
            paths.extend(polygon_path(polygon) for polygon in geometry["coordinates"])
    return paths


def land_component_labels(
    land_paths: list[MplPath], longitudes: np.ndarray, latitudes: np.ndarray
) -> np.ndarray:
    labels = np.full((len(latitudes), len(longitudes)), -1, dtype=np.int32)
    for component, path in enumerate(land_paths):
        minimum = path.vertices.min(axis=0)
        maximum = path.vertices.max(axis=0)
        lon_indices = np.flatnonzero(
            (longitudes >= minimum[0]) & (longitudes <= maximum[0])
        )
        lat_indices = np.flatnonzero(
            (latitudes >= minimum[1]) & (latitudes <= maximum[1])
        )
        if not len(lon_indices) or not len(lat_indices):
            continue
        grid_lon, grid_lat = np.meshgrid(
            longitudes[lon_indices], latitudes[lat_indices]
        )
        candidates = np.column_stack((grid_lon.ravel(), grid_lat.ravel()))
        inside = path.contains_points(candidates, radius=1e-10).reshape(grid_lon.shape)
        window = labels[np.ix_(lat_indices, lon_indices)]
        window[(window < 0) & inside] = component
        labels[np.ix_(lat_indices, lon_indices)] = window
    return labels


def point_land_component(point: dict[str, object], land_paths: list[MplPath]) -> int:
    location = (float(point["longitude"]), float(point["latitude"]))
    for component, path in enumerate(land_paths):
        if path.contains_point(location, radius=0.35):
            return component
    return -1


def connected_land_kde(
    points: Iterable[dict[str, object]],
    longitudes: np.ndarray,
    latitudes: np.ndarray,
    bandwidth_km: float,
    land_paths: list[MplPath],
) -> np.ndarray:
    grid_lon = np.deg2rad(longitudes)[None, :]
    grid_lat = np.deg2rad(latitudes)[:, None]
    component_labels = land_component_labels(land_paths, longitudes, latitudes)
    density = np.zeros(component_labels.shape, dtype=np.float64)

    for point in points:
        component = point_land_component(point, land_paths)
        if component < 0:
            continue
        point_lon = math.radians(float(point["longitude"]))
        point_lat = math.radians(float(point["latitude"]))
        cosine = np.sin(grid_lat) * math.sin(point_lat) + np.cos(
            grid_lat
        ) * math.cos(point_lat) * np.cos(grid_lon - point_lon)
        distance_km = EARTH_RADIUS_KM * np.arccos(np.clip(cosine, -1.0, 1.0))
        kernel = np.exp(-0.5 * np.square(distance_km / bandwidth_km))
        kernel[component_labels != component] = 0.0
        density += kernel
    return density


def render(
    points: list[dict[str, object]], land_paths: list[MplPath], theme: str
) -> None:
    longitudes = np.linspace(-180.0, 180.0, 1440)
    latitudes = np.linspace(*MAP_LATITUDE_LIMITS, 580)
    density = connected_land_kde(points, longitudes, latitudes, 400.0, land_paths)
    density /= density.max()

    palette = THEMES[theme]
    # Compress the dynamic range so isolated authors remain clearly visible
    # beside dense regional clusters.
    visible_density = np.power(density, DENSITY_GAMMA)
    rgba = LinearSegmentedColormap.from_list(
        f"tb_science_proposal_density_{theme}", palette["density"]
    )(visible_density)
    rgba[..., 3] = np.where(
        density > 0.0015, np.clip(visible_density * DENSITY_MAX_ALPHA, 0.0, DENSITY_MAX_ALPHA), 0.0
    )

    fig = plt.figure(figsize=(12.8, 5.5), dpi=100, facecolor=(0, 0, 0, 0))
    ax = fig.add_axes((0.0, 0.0, 1.0, 1.0), facecolor=(0, 0, 0, 0))
    ax.set_xlim(-180, 180)
    ax.set_ylim(*MAP_LATITUDE_LIMITS)
    ax.set_aspect("equal", adjustable="box")
    ax.axis("off")

    for path in land_paths:
        ax.add_patch(
            PathPatch(
                path,
                facecolor=palette["land"],
                edgecolor=palette["coast"],
                linewidth=0.55,
                zorder=1,
            )
        )

    compound_land = MplPath.make_compound_path(*land_paths)
    clip_patch = PathPatch(compound_land, transform=ax.transData, facecolor="none")
    heatmap = ax.imshow(
        rgba,
        origin="lower",
        extent=(-180, 180, *MAP_LATITUDE_LIMITS),
        interpolation="bilinear",
        zorder=2,
    )
    heatmap.set_clip_path(clip_patch)

    suffix = "" if theme == "light" else "-dark"
    png_path = OUTPUT_DIR / f"tb-science-contributor-geography{suffix}.png"
    webp_path = OUTPUT_DIR / f"tb-science-contributor-geography{suffix}.webp"
    fig.savefig(png_path, dpi=100, transparent=True)
    plt.close(fig)
    with Image.open(png_path) as image:
        image.convert("RGBA").save(
            webp_path, "WEBP", lossless=True, method=6, exact=True
        )


def main() -> None:
    dashboard = fetch_json(DASHBOARD_DATA_URL)
    logins = proposal_logins(dashboard)
    token = github_token()
    profiles = fetch_profiles(logins, token)
    declared_names = proposal_author_names(dashboard)
    profiles = [
        {
            **profile,
            "name": declared_names.get(
                str(profile.get("login") or "").casefold(),
                profile.get("name"),
            ),
        }
        for profile in profiles
    ]
    pr_authors = fetch_pr_authors(dashboard, token)
    authors = combine_authors(profiles, pr_authors)
    points, unique_location_strings = geocode_profiles(authors)
    land_paths = load_land_paths()
    on_land = [
        point for point in points if point_land_component(point, land_paths) >= 0
    ]
    if not on_land:
        raise RuntimeError("No proposal-author locations could be mapped")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for theme in THEMES:
        render(on_land, land_paths, theme)

    stats = {
        "proposals": len(dashboard["proposals"]),
        "unique_proposal_authors": len(logins),
        "profiles_found": sum(not profile.get("missing") for profile in profiles),
        "profiles_with_locations": sum(
            bool(profile.get("location")) for profile in profiles
        ),
        "unique_pr_task_authors": len(
            {
                normalized_person(str(author.get("name") or ""))
                for author in pr_authors
                if author.get("name")
            }
        ),
        "combined_unique_authors": len(authors),
        "unique_location_strings": unique_location_strings,
        "mapped_authors": len(on_land),
    }
    author_records = []
    for point in sorted(
        on_land,
        key=lambda item: (
            str(item.get("name") or item.get("login") or "").casefold(),
            str(item.get("display_name") or ""),
        ),
    ):
        name = str(point.get("name") or point.get("login") or "").strip()
        if not name:
            continue
        display_name = str(point.get("display_name") or "").strip()
        country = display_name.split(",")[-1].strip() if display_name else ""
        author_records.append(
            {
                "name": name,
                "login": str(point.get("login") or "").strip() or None,
                "location": str(point.get("geocoding_query") or point.get("location") or "").strip()
                or None,
                "place": display_name or None,
                "country": country or None,
            }
        )
    (OUTPUT_DIR / "tb-science-contributor-geography.json").write_text(
        json.dumps(stats, indent=2) + "\n"
    )
    (OUTPUT_DIR / "tb-science-contributor-geography-authors.json").write_text(
        json.dumps(author_records, indent=2) + "\n"
    )
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
