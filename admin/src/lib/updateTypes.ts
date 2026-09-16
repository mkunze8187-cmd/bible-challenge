export interface InstallerAssetInfo {
  assetName: string;
  assetSize: number;
}

export interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseName?: string;
  releaseUrl: string;
  mainInstaller: InstallerAssetInfo | null;
  adminInstaller: InstallerAssetInfo | null;
  message: string;
}

export interface UpdateInstallOneResult {
  started: boolean;
  installerPath?: string;
  message: string;
}

export interface UpdateInstallBothResult {
  main: UpdateInstallOneResult;
  admin: UpdateInstallOneResult;
}
