// For an offline DuckDB audit of the exact browser classification expression.
import { placeQuery } from "../src/processor";

process.stdout.write(placeQuery("sample", "true", false));
