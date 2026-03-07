export function getNeatExportApiKey() {
  return process.env.NEATEXPORT_API_KEY || process.env.FITFORPDF_BENCHMARK_KEY || null;
}
