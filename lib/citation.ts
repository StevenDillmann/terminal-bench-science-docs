/** Canonical citation. The concept DOI always resolves to the latest version. */
export const CITATION_DOI = '10.5281/zenodo.22110253';
export const CITATION_DOI_URL = `https://doi.org/${CITATION_DOI}`;
export const CITATION_REPO_URL =
  'https://github.com/harbor-framework/terminal-bench-science';

export const CITATION_BIBTEX = `@software{Terminal-Bench-Science_2026,
  author = {{Terminal-Bench-Science Team}},
  doi = {${CITATION_DOI}},
  license = {Apache-2.0},
  title = {{Terminal-Bench-Science: Evaluating AI agents on research workflows across scientific domains}},
  url = {${CITATION_REPO_URL}},
  year = {2026}
}`;

/** APA 7 reference for the software record. */
export const CITATION_APA =
  'Terminal-Bench-Science Team. (2026). Terminal-Bench-Science: Evaluating AI agents on research workflows across scientific domains [Computer software]. ' +
  CITATION_DOI_URL;
