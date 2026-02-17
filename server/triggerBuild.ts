/**
 * Trigger Android build on GitHub Actions
 * This replaces local compilation with GitHub Actions workflow
 */

import { ENV } from './_core/env';

export interface TriggerBuildResult {
  success: boolean;
  runId?: string;
  error?: string;
}

/**
 * Trigger GitHub Actions workflow to compile Android project
 */
export async function triggerGitHubBuild(
  buildId: number,
  projectZipUrl: string,
  buildType: 'debug' | 'release'
): Promise<TriggerBuildResult> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return {
        success: false,
        error: 'GITHUB_TOKEN não configurado'
      };
    }

    const owner = 'Carlos20473736';
    const repo = 'Compilador';
    const workflow = 'android-build.yml';

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            build_id: String(buildId),
            project_url: projectZipUrl,
            build_type: buildType
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `GitHub API error: ${response.status} - ${error}`
      };
    }

    // GitHub Actions dispatch doesn't return run ID directly
    // We need to fetch it from the workflow runs
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for workflow to start

    const runsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/runs?per_page=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (runsResponse.ok) {
      const data = await runsResponse.json();
      const latestRun = data.workflow_runs?.[0];
      if (latestRun) {
        return {
          success: true,
          runId: String(latestRun.id)
        };
      }
    }

    return {
      success: true,
      error: 'Build disparado, mas não foi possível obter o run ID'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get GitHub Actions workflow run status
 */
export async function getGitHubRunStatus(runId: string) {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return {
        status: 'error',
        message: 'GITHUB_TOKEN não configurado'
      };
    }

    const owner = 'Carlos20473736';
    const repo = 'Compilador';

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      return {
        status: 'error',
        message: `GitHub API error: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      status: data.status,
      conclusion: data.conclusion,
      html_url: data.html_url,
      artifacts_url: data.artifacts_url
    };

  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Download APK from GitHub Actions artifacts
 */
export async function downloadGitHubArtifact(runId: string, buildId: number) {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return {
        success: false,
        error: 'GITHUB_TOKEN não configurado'
      };
    }

    const owner = 'Carlos20473736';
    const repo = 'Compilador';

    // Get artifacts for the run
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `GitHub API error: ${response.status}`
      };
    }

    const data = await response.json();
    const artifact = data.artifacts?.find((a: any) =>
      a.name.includes(`android-apk-${buildId}`)
    );

    if (!artifact) {
      return {
        success: false,
        error: 'APK artifact não encontrado'
      };
    }

    return {
      success: true,
      downloadUrl: artifact.archive_download_url,
      artifactId: artifact.id
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
