-- Enforce one pick per month/year
CREATE UNIQUE INDEX picks_month_year_unique ON picks (month, year);
