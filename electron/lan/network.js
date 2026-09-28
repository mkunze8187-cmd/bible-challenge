const { execFile } = require("node:child_process");
const os = require("node:os");

const BLOCKED_ADAPTER_PATTERN = /vpn|virtual|hyper-v|wsl|docker|loopback|vethernet|tap|tun|npcap|bluetooth/i;

function getAvailableAdapters() {
  const interfaces = os.networkInterfaces();
  const adapters = [];

  for (const [name, entries] of Object.entries(interfaces)) {
    if (BLOCKED_ADAPTER_PATTERN.test(name)) {
      continue;
    }

    for (const entry of entries ?? []) {
      if (entry.family !== "IPv4" || entry.internal || !entry.address) {
        continue;
      }

      adapters.push({
        name,
        address: entry.address,
        cidr: entry.cidr ?? null,
        mac: entry.mac ?? null
      });
    }
  }

  return adapters.sort((left, right) => left.name.localeCompare(right.name) || left.address.localeCompare(right.address));
}

function selectAdapter(preferredAddress) {
  const adapters = getAvailableAdapters();
  if (preferredAddress === "127.0.0.1") {
    return {
      name: "Loopback",
      address: "127.0.0.1",
      cidr: "127.0.0.1/8",
      mac: null
    };
  }
  const preferred = preferredAddress ? adapters.find((adapter) => adapter.address === preferredAddress) : null;

  return preferred ?? adapters[0] ?? {
    name: "Loopback",
    address: "127.0.0.1",
    cidr: "127.0.0.1/8",
    mac: null
  };
}

function execPowerShell(command) {
  return new Promise((resolve) => {
    execFile("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command], { windowsHide: true }, (error, stdout) => {
      if (error) {
        resolve("");
        return;
      }

      resolve(String(stdout ?? "").trim());
    });
  });
}

async function getWindowsNetworkProfile(address) {
  if (process.platform !== "win32" || !address) {
    return null;
  }

  const escapedAddress = address.replace(/'/g, "''");
  const command = [
    "$ip = Get-NetIPAddress -AddressFamily IPv4 -IPAddress '" + escapedAddress + "' -ErrorAction SilentlyContinue | Select-Object -First 1;",
    "if ($ip) {",
    "Get-NetConnectionProfile -InterfaceIndex $ip.InterfaceIndex | Select-Object -First 1 -ExpandProperty NetworkCategory",
    "}"
  ].join(" ");
  const profile = await execPowerShell(command);

  return profile || null;
}

async function getWifiSsid() {
  if (process.platform !== "win32") {
    return null;
  }

  return new Promise((resolve) => {
    execFile("netsh.exe", ["wlan", "show", "interfaces"], { windowsHide: true }, (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }

      const match = String(stdout ?? "").match(/^\s*SSID\s*:\s*(.+)$/m);
      resolve(match?.[1]?.trim() || null);
    });
  });
}

module.exports = {
  getAvailableAdapters,
  getWifiSsid,
  getWindowsNetworkProfile,
  selectAdapter
};
