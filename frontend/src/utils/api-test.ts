/**
 * API 测试工具
 * 用于验证后端 API 端点的可访问性
 */

interface TestResult {
  name: string;
  url: string;
  method: string;
  success: boolean;
  error?: string;
  duration: number;
}

class APITester {
  private baseURL: string;
  private results: TestResult[] = [];

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  /**
   * 执行单个测试
   */
  private async testEndpoint(
    name: string,
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<TestResult> {
    const startTime = performance.now();
    const fullUrl = `${this.baseURL}${url}`;

    try {
      const response = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });

      const duration = performance.now() - startTime;
      const result: TestResult = {
        name,
        url: fullUrl,
        method,
        success: response.ok,
        duration,
      };

      if (!response.ok) {
        try {
          const errorData = await response.json();
          result.error = `HTTP ${response.status}: ${errorData.message || response.statusText}`;
        } catch {
          result.error = `HTTP ${response.status}: ${response.statusText}`;
        }
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const result: TestResult = {
        name,
        url: fullUrl,
        method,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration,
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<TestResult[]> {
    console.group('🧪 API 端点测试开始');
    console.log(`Base URL: ${this.baseURL}`);
    console.time('Total Test Time');

    // 服务器管理 API 测试
    await this.testEndpoint('获取服务器列表', '/server', 'GET');
    // await this.testEndpoint('创建服务器', '/server', 'POST', {
    //   ip: '192.168.1.1',
    //   port: 22,
    //   ssh_user: 'root',
    //   password: 'test',
    // });

    // 分组管理 API 测试
    await this.testEndpoint('获取分组列表', '/group', 'GET');
    // await this.testEndpoint('创建分组', '/group', 'POST', {
    //   name: '测试分组',
    //   description: '测试描述',
    // });

    // 计划任务 API 测试
    await this.testEndpoint('获取计划任务列表', '/cronjob', 'GET');

    console.timeEnd('Total Test Time');
    console.groupEnd();

    this.printSummary();
    return this.results;
  }

  /**
   * 打印测试摘要
   */
  private printSummary(): void {
    const total = this.results.length;
    const success = this.results.filter(r => r.success).length;
    const failed = total - success;

    console.group('📊 测试结果摘要');
    console.log(`总计: ${total}`);
    console.log(`成功: ${success} (${(success / total * 100).toFixed(1)}%)`);
    console.log(`失败: ${failed} (${(failed / total * 100).toFixed(1)}%)`);
    console.groupEnd();

    if (failed > 0) {
      console.group('❌ 失败的测试');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.error(`❌ ${r.name}`);
          console.error(`   URL: ${r.url}`);
          console.error(`   Method: ${r.method}`);
          console.error(`   Error: ${r.error}`);
          console.error(`   Duration: ${r.duration.toFixed(2)}ms`);
        });
      console.groupEnd();
    }

    console.group('✅ 成功的测试');
    this.results
      .filter(r => r.success)
      .forEach(r => {
        console.log(`✅ ${r.name} (${r.duration.toFixed(2)}ms)`);
      });
    console.groupEnd();
  }

  /**
   * 在浏览器中显示结果
   */
  displayInBrowser(): void {
    const container = document.createElement('div');
    container.id = 'api-test-results';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      background: white;
      border-radius:ser 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    const total = this.results.length;
    const success = this.results.filter(r => r.success).length;
    const failed = total - success;

    container.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #e5e6eb; display: flex; justify-content: space-between; align-items: center; background: #f7f8fa;">
      <strong>API 测试结果</strong>
      <button onclick="document.getElementById('api-test-results').remove()" style="border: none; background: none; cursor: pointer; font-size: 18px;">&times;</button>
      </div>
      <div style="padding: 12px 16px;">
        <div style="display: flex; gap: 16px; margin-bottom: 12px;">
          <div><span style="color: #00b42a;">✓</span> 成功: ${success}</div>
          <div><span style="color: #f53f3f;">✗</span> 失败: ${failed}</div>
          <div>总计: ${total}</div>
        </div>
        <div style="max-height: 60vh; overflow: auto; padding-right: 8px;">
          ${this.results.map(r => `
            <div style="padding: 8px; margin-bottom: 8px; border-radius: 4px; background: ${r.success ? '#e8ffea' : '#ffeef0'}; border: 1px solid ${r.success ? '#00b42a' : '#f53f3f'};">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <strong>${r.success ? '✓' : '✗'} ${r.name}</strong>
                <span style="color: #86909c; font-size: 12px;">${r.duration.toFixed(0)}ms</span>
              </div>
              <div style="font-size: 12px; color: #4e5969; word-break: break-all;">${r.url}</div>
              ${r.error ? `<div style="margin-top: 4px; color: #f53f3f; font-size: 12px;">${r.error}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(container);
  }
}

/**
 * 运行 API 测试
 * 使用方法：
 * 1. 在浏览器控制台运行：testAPI()
 * 2. 或在代码中导入并使用
 */
export async function testAPI(baseURL: string = '/api'): Promise<TestResult[]> {
  const tester = new APITester(baseURL);
  const results = await tester.runAllTests();
  tester.displayInBrowser();
  return results;
}

// 如果在浏览器环境中，将 testAPI 挂载到 window
if (typeof window !== 'undefined') {
  (window as any).testAPI = testAPI;
  console.log('💡 API 测试工具已就绪');
  console.log('   在控制台运行 testAPI() 开始测试');
}
