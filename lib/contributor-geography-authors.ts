import authorsJson from '../public/tb-science-contributor-geography-authors.json';

export type ContributorGeographyAuthor = {
  name: string;
  login: string | null;
  location: string | null;
  place: string | null;
  country: string | null;
};

export const CONTRIBUTOR_GEOGRAPHY_AUTHORS =
  authorsJson as ContributorGeographyAuthor[];
