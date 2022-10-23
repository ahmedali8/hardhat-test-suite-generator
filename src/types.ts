export interface TestSuiteGeneratorConfig {
  excludeContracts: string[];
  outDirName: string;
}

export interface TestSuiteGeneratorUserConfig {
  excludeContracts?: string[];
  outDirName?: string;
}
