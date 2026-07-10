import readline from "node:readline";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const NPX = process.platform === "win32" ? "npx.cmd" : "npx";
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";

const REQUIRED_FILES = ["package.json", ".env.example"];
const POSTGRES_CONTAINER = "fliptrack_postgres";
const DOCKER_COMPOSE_FILE = "docker-compose.yml";

/* ------------------------------------------------------- */
/* Console Helpers                                         */
/* ------------------------------------------------------- */

function success(message) {
    console.log(`\n✅ ${message}`);
}

function warning(message) {
    console.log(`\n⚠️ ${message}`);
}

function info(message) {
    console.log(`\nℹ️ ${message}`);
}

function error(message) {
    console.error(`\n❌ ${message}`);
}

function clearConsole() {
    try {
        console.clear();
    } catch {
        process.stdout.write("\x1B[2J\x1B[0f");
    }
}

/* ------------------------------------------------------- */
/* Prompt Helpers                                          */
/* ------------------------------------------------------- */

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
    });
}

async function confirm(question) {
    const answer = (await ask(question)).toLowerCase();

    return (
        answer === "" ||
        answer === "y" ||
        answer === "yes"
    );
}

/* ------------------------------------------------------- */
/* Execute Commands                                        */
/* ------------------------------------------------------- */

function run(command, args = [], options = {}) {
    console.log(`\n▶ ${command} ${args.join(" ")}`);

    const result = spawnSync(command, args, {
        stdio: "inherit",
        shell: process.platform === "win32",
        ...options,
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(`${command} exited with code ${result.status}`);
    }

    return result;
}

/* ------------------------------------------------------- */
/* Check Command Availability                              */
/* ------------------------------------------------------- */

function commandExists(command) {
    const checker =
        process.platform === "win32"
            ? "where"
            : "which";

    const result = spawnSync(
        checker,
        [command],
        {
            stdio: "ignore",
            shell: process.platform === "win32",
        }
    );

    return result.status === 0;
}

function validateDockerPrerequisites() {
    if (!fs.existsSync(DOCKER_COMPOSE_FILE)) {
        error(`${DOCKER_COMPOSE_FILE} not found.

The Docker setup requires a docker-compose.yml file in the project root.
If you're using Supabase, you can skip Docker setup in the next step.`);
        return false;
    }

    return true;
}

/* ------------------------------------------------------- */
/* Check Node.js Version                                   */
/* ------------------------------------------------------- */

function checkNodeVersion() {
    const nodeVersion = process.versions.node;
    const [major] = nodeVersion.split(".").map(Number);

    if (major < 18) {
        error(
            `Node.js 18+ is required. You have ${nodeVersion}.

Please upgrade Node.js from: https://nodejs.org/`
        );

        process.exit(1);
    }

    info(`Using Node.js ${nodeVersion}`);
}

/* ------------------------------------------------------- */
/* Project Validation                                      */
/* ------------------------------------------------------- */

function ensureProjectFiles() {
    for (const file of REQUIRED_FILES) {
        if (!fs.existsSync(file)) {
            error(`${file} not found.

Run this script from the project root.`);
            process.exit(1);
        }
    }

    if (!fs.existsSync("node_modules")) {
        error(`Dependencies are not installed.

Run: npm install
Then: npm run setup`);
        process.exit(1);
    }
}
/* ------------------------------------------------------- */
/* Environment File Utilities                              */
/* ------------------------------------------------------- */

function createEnvFile() {
    if (fs.existsSync(".env")) {
        success(".env already exists.");
        return;
    }

    fs.copyFileSync(".env.example", ".env");

    success("Created .env from .env.example");

    info("Placeholder values in .env have been set. You'll configure them in the next step.");
}

function updateEnvValue(content, key, value) {
    const regex = new RegExp(`^${key}=".*?"$`, "m");

    if (regex.test(content)) {
        return content.replace(regex, `${key}="${value}"`);
    }

    return `${content.trim()}\n${key}="${value}"\n`;
}

/* ------------------------------------------------------- */
/* Configure Docker Environment                            */
/* ------------------------------------------------------- */

function configureDockerEnv() {
    let env = fs.readFileSync(".env", "utf8");

    env = updateEnvValue(
        env,
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/fliptrack_dev"
    );

    env = updateEnvValue(
        env,
        "DIRECT_URL",
        "postgresql://postgres:password@localhost:5432/fliptrack_dev"
    );

    fs.writeFileSync(".env", env);

    success("Configured .env for local PostgreSQL.");
}

/* ------------------------------------------------------- */
/* Configure Supabase Environment                          */
/* ------------------------------------------------------- */

async function configureSupabaseEnv() {
    let env = fs.readFileSync(".env", "utf8");

    console.log(`
Enter your Supabase details.

You can find them in:

Project Settings
→ API
→ Database
`);

    const url = await ask("Supabase URL: ");

    const anon = await ask("Supabase Anon Key: ");

    const database = await ask("DATABASE_URL: ");

    const direct = await ask("DIRECT_URL: ");

    env = updateEnvValue(
        env,
        "NEXT_PUBLIC_SUPABASE_URL",
        url
    );

    env = updateEnvValue(
        env,
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        anon
    );

    env = updateEnvValue(
        env,
        "DATABASE_URL",
        database
    );

    env = updateEnvValue(
        env,
        "DIRECT_URL",
        direct
    );

    fs.writeFileSync(".env", env);

    success("Supabase configuration saved.");
}

/* ------------------------------------------------------- */
/* Docker Installation                                     */
/* ------------------------------------------------------- */

async function ensureDockerInstalled() {
    if (commandExists("docker")) {
        return true;
    }

    error("Docker is not installed.");

    const platform = process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux";

    const install = await confirm(
        "Would you like to install Docker first? (Y/n): "
    );

    if (install) {
        let installUrl = "https://docs.docker.com/get-docker/";

        if (platform === "Windows") {
            console.log(`
Install Docker Desktop for Windows:

https://docs.docker.com/desktop/install/windows-install/

Note: WSL 2 is recommended for best performance.

After installation, restart your terminal and run:

npm run setup
`);
        } else if (platform === "macOS") {
            console.log(`
Install Docker Desktop for macOS:

https://docs.docker.com/desktop/install/mac-install/

After installation run:

npm run setup
`);
        } else {
            console.log(`
Install Docker on Linux:

https://docs.docker.com/engine/install/

After installation, enable Docker daemon:

sudo systemctl enable --now docker

Then run:

npm run setup
`);
        }

        process.exit(0);
    }

    const useSupabase = await confirm(
        "Continue with Supabase instead? (Y/n): "
    );

    return !useSupabase ? process.exit(0) : false;
}

/* ------------------------------------------------------- */
/* Docker Running Check                                    */
/* ------------------------------------------------------- */

async function ensureDockerRunning() {
    const result = spawnSync(
        "docker",
        ["info"],
        {
            stdio: "ignore",
            shell: process.platform === "win32",
        }
    );

    if (result.status === 0) {
        return true;
    }

    warning("Docker is installed but isn't running.");

    console.log(`
Linux

sudo systemctl enable --now docker

Windows/macOS

Start Docker Desktop
`);

    await ask("Press ENTER once Docker is running...");

    const retry = spawnSync(
        "docker",
        ["info"],
        {
            stdio: "ignore",
            shell: process.platform === "win32",
        }
    );

    if (retry.status === 0) {
        return true;
    }

    error("Docker still isn't available.");

    const useSupabase = await confirm(
        "Continue with Supabase instead? (Y/n): "
    );

    return !useSupabase ? process.exit(1) : false;
}
/* ------------------------------------------------------- */
/* Wait for PostgreSQL                                     */
/* ------------------------------------------------------- */

function waitForContainerHealth(containerName, retries = 12) {
    info("Waiting for PostgreSQL to become healthy...");

    for (let i = 0; i < retries; i++) {
        try {
            const result = spawnSync(
                "docker",
                [
                    "inspect",
                    "--format={{.State.Health.Status}}",
                    containerName,
                ],
                {
                    encoding: "utf8",
                    shell: process.platform === "win32",
                }
            );

            if (result.stdout?.trim() === "healthy") {
                success("PostgreSQL is healthy.");
                return;
            }
        } catch (err) {
            console.log(`Health check error: ${err.message}`);
        }

        console.log(`Waiting... (${i + 1}/${retries})`);
        sleep(5);
    }

    throw new Error("PostgreSQL did not become healthy in time.");
}

function sleep(seconds) {
    spawnSync(
        process.platform === "win32" ? "timeout" : "sleep",
        process.platform === "win32"
            ? ["/T", seconds.toString(), "/NOBREAK"]
            : [seconds.toString()],
        { stdio: "ignore" }
    );
}

/* ------------------------------------------------------- */
/* Prisma Setup                                            */
/* ------------------------------------------------------- */

function runPrismaSetup() {
    info("Running Prisma setup...");

    try {
        run(NPX, ["prisma", "db", "push"]);
        run(NPX, ["prisma", "generate"]);

        success("Prisma setup completed.");
    } catch (err) {
        error("Prisma setup failed.");

        const errorMessage = err.message || "";

        let guidance = `
Possible reasons:

• PostgreSQL is not running
• DATABASE_URL is incorrect
• .env is misconfigured
• Prisma schema contains errors

`;

        if (errorMessage.includes("ECONNREFUSED")) {
            guidance = `
Database connection failed (ECONNREFUSED).

If using Docker:
  • Ensure Docker is running
  • Run: docker compose up -d
  • Wait 10-15 seconds for PostgreSQL to be ready
  • Re-run: npm run setup

If using Supabase:
  • Verify DIRECT_URL in .env is correct
  • Check Supabase project is active
  • Verify your IP is allowed in firewall settings

`;
        } else if (errorMessage.includes("authentication failed")) {
            guidance = `
Database authentication failed.

Check your .env file:

Docker: DATABASE_URL="postgresql://postgres:password@localhost:5432/fliptrack_dev"

Supabase: DATABASE_URL and DIRECT_URL from Project Settings → Database → Connection strings

`;
        } else if (errorMessage.includes("does not exist")) {
            guidance = `
Database or schema doesn't exist.

If using Docker:
  • Run: docker compose down -v
  • Run: docker compose up -d
  • Wait 10-15 seconds for PostgreSQL to initialize
  • Re-run: npm run setup

`;
        }

        console.log(guidance);
        console.log(`Re-run:\n\nnpm run setup\n`);

        throw err;
    }
}

/* ------------------------------------------------------- */
/* Docker Setup                                            */
/* ------------------------------------------------------- */

async function dockerSetup() {
    info("Preparing Docker environment...");

    if (!validateDockerPrerequisites()) {
        return supabaseSetup();
    }

    const installed = await ensureDockerInstalled();

    if (!installed) {
        return supabaseSetup();
    }

    const running = await ensureDockerRunning();

    if (!running) {
        return supabaseSetup();
    }

    configureDockerEnv();
    info("Starting PostgreSQL...");

    try {
        startDockerCompose();
    } catch (err) {
        error("Failed to start Docker Compose.");
        throw err;
    }

    try {
        waitForContainerHealth(POSTGRES_CONTAINER);
    } catch {
        warning("Health check unavailable. Continuing...");
    }

    success("Docker PostgreSQL is ready.");
    runPrismaSetup();
}

function startDockerCompose() {
    const commands = [
        {
            cmd: "docker",
            args: ["compose", "up", "-d", "--wait"],
            description: "Docker Compose with --wait"
        },
        {
            cmd: "docker",
            args: ["compose", "up", "-d"],
            description: "Docker Compose (fallback)"
        },
        {
            cmd: "docker-compose",
            args: ["up", "-d"],
            description: "Legacy docker-compose command"
        }
    ];

    for (const { cmd, args, description } of commands) {
        try {
            run(cmd, args);
            return;
        } catch (err) {
            warning(`${description} failed. Trying next method...`);
        }
    }

    throw new Error("Unable to start Docker Compose with any available method.");
}
/* ------------------------------------------------------- */
/* Supabase Setup                                          */
/* ------------------------------------------------------- */

async function supabaseSetup() {
  info("Setting up Supabase...");

  await configureSupabaseEnv();

  runPrismaSetup();
}

/* ------------------------------------------------------- */
/* Development Server                                      */
/* ------------------------------------------------------- */

async function startDevelopmentServer() {
  const start = await confirm(
    "\nStart the development server now? (Y/n): "
  );

  if (!start) {
    info("You can start it later using:");

    console.log(`
npm run dev
`);

    return;
  }

  run(NPM, ["run", "dev"]);
}

/* ------------------------------------------------------- */
/* Main                                                    */
/* ------------------------------------------------------- */

async function main() {
  clearConsole();

  console.log(`
=========================================================
🚀 FlipTrack Setup Wizard
=========================================================

This wizard will:

✓ Verify environment

✓ Create .env from .env.example

✓ Configure Docker or Supabase

✓ Setup PostgreSQL

✓ Configure Prisma

✓ Optionally start the dev server

=========================================================
`);

  checkNodeVersion();
  ensureProjectFiles();
  createEnvFile();

  const choice = await getDatabaseChoice();

  try {
    if (choice === "docker") {
      await dockerSetup();
    } else if (choice === "supabase") {
      await supabaseSetup();
    }
  } catch (err) {
    error("Database setup failed.");
    throw err;
  }

  await startDevelopmentServer();
  success("FlipTrack setup completed successfully.");
  displayFinalMessage();

  rl.close();
}

async function getDatabaseChoice() {
  console.log(`
Choose your database

1) Docker (Recommended)

2) Supabase

`);

  const input = (
    await ask("Enter your choice (1 / 2 / docker / supabase): ")
  )
    .trim()
    .toLowerCase();

  const choiceMap = {
    "1": "docker",
    "docker": "docker",
    "d": "docker",
    "2": "supabase",
    "supabase": "supabase",
    "s": "supabase"
  };

  const choice = choiceMap[input];

  if (!choice) {
    throw new Error(`Invalid choice: "${input}". Please use "1" or "2".`);
  }

  return choice;
}

function displayFinalMessage() {
  console.log(`
=========================================================

🎉 Everything is ready.

Useful Commands

Start Development

npm run dev

Start PostgreSQL

docker compose up -d

Stop PostgreSQL

docker compose down

Delete Database

docker compose down -v

Happy Coding ❤️

=========================================================
`);
}

/* ------------------------------------------------------- */
/* Error Handling                                          */
/* ------------------------------------------------------- */

main()
  .catch((err) => {
    console.error("\n❌ Setup failed.\n");

    console.error(err.message);

    rl.close();

    process.exit(1);
  });