import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = "Carlos20473736";
const REPO = "Compilador";
const WORKFLOW_ID = "android-build.yml";

export async function triggerAndroidBuild(
  projectUrl: string,
  buildType: "debug" | "release"
) {
  try {
    const response = await octokit.actions.createWorkflowDispatch({
      owner: OWNER,
      repo: REPO,
      workflow_id: WORKFLOW_ID,
      ref: "main",
      inputs: {
        build_type: buildType,
        project_url: projectUrl,
      },
    });

    return {
      success: true,
      message: "Build iniciado com sucesso",
      runId: response.status === 204 ? "pending" : null,
    };
  } catch (error) {
    console.error("Erro ao disparar workflow:", error);
    return {
      success: false,
      message: "Erro ao iniciar build",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getWorkflowRuns() {
  try {
    const response = await octokit.actions.listWorkflowRuns({
      owner: OWNER,
      repo: REPO,
      workflow_id: WORKFLOW_ID,
      per_page: 10,
    });

    return response.data.workflow_runs.map((run) => ({
      id: run.id,
      status: run.status,
      conclusion: run.conclusion,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      htmlUrl: run.html_url,
    }));
  } catch (error) {
    console.error("Erro ao buscar runs:", error);
    return [];
  }
}

export async function getWorkflowRunArtifacts(runId: number) {
  try {
    const response = await octokit.actions.listWorkflowRunArtifacts({
      owner: OWNER,
      repo: REPO,
      run_id: runId,
    });

    return response.data.artifacts;
  } catch (error) {
    console.error("Erro ao buscar artifacts:", error);
    return [];
  }
}

export async function downloadArtifact(artifactId: number) {
  try {
    const response = await octokit.actions.downloadArtifact({
      owner: OWNER,
      repo: REPO,
      artifact_id: artifactId,
      archive_format: "zip",
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao baixar artifact:", error);
    return null;
  }
}
