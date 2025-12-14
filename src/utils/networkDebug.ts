// utils/networkDebug.ts
import NetInfo from "@react-native-async-storage/async-storage"; // If you have it installed

export class NetworkDebugger {
  /**
   * Check device network connectivity
   */
  static async checkNetworkConnectivity(): Promise<{
    isConnected: boolean;
    connectionType?: string;
    details?: any;
  }> {
    try {
      // Basic fetch test to a reliable endpoint
      const testResponse = await fetch("https://www.google.com", {
        method: "HEAD",
        mode: "no-cors",
      });

      return {
        isConnected: true,
        connectionType: "unknown",
        details: { status: testResponse.status },
      };
    } catch (error) {
      console.error("❌ Network connectivity test failed:", error);
      return {
        isConnected: false,
        details: { error: (error as Error).message },
      };
    }
  }

  /**
   * Test specific backend URL reachability
   */
  static async testBackendReachability(baseUrl: string): Promise<{
    isReachable: boolean;
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      console.log(`🔍 Testing reachability: ${baseUrl}`);

      const response = await fetch(baseUrl, {
        method: "HEAD",
        headers: {
          "User-Agent": "Journee-Mobile-App/1.0",
        },
      });

      const responseTime = Date.now() - startTime;

      return {
        isReachable: response.ok,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        isReachable: false,
        responseTime,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Comprehensive network diagnosis
   */
  static async diagnoseConnection(backendUrl: string): Promise<void> {
    console.log("🔧 [NETWORK] Starting network diagnosis...");

    // Test general connectivity
    const connectivity = await this.checkNetworkConnectivity();
    console.log("🌐 [NETWORK] General connectivity:", connectivity);

    // Test backend reachability
    const reachability = await this.testBackendReachability(backendUrl);
    console.log("🎯 [NETWORK] Backend reachability:", reachability);

    // DNS test
    try {
      const dnsTest = await fetch(
        `https://dns.google/resolve?name=${new URL(backendUrl).hostname}&type=A`
      );
      const dnsData = await dnsTest.json();
      console.log(
        "🌍 [NETWORK] DNS resolution:",
        dnsData.Answer ? "SUCCESS" : "FAILED"
      );
    } catch (error) {
      console.log("🌍 [NETWORK] DNS test failed:", (error as Error).message);
    }
  }
}
