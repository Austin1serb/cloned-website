import os
import subprocess
import random
from datetime import datetime, timedelta

# Configuration
NUM_COMMITS = 10  # Number of commits to create
START_DATE = datetime(2022, 10, 4)  # Start of date range for backdating
END_DATE = datetime(2022, 12, 25)  # End of date range for backdating

# Example commit messages
COMMIT_MESSAGES = [
    "fix: forgot to check null on login",
    "trying something new hope it works",
    "fixing the thing from last commit",
    "idk why this broke but fixing it",
    "added more logs for debugging",
    "finally fixed the issue (i think)",
    "removed some code that was useless",
    "oops forgot to commit this earlier",
    "quick fix for prod (temp solution)",
    "added a button, need to style it",
    "updated readme, not sure if correct",
    "made some changes, pls review",
    "refactored a bit but still messy",
    "fix typo in file name (again)",
    "testing something new, not final",
    "added validation (might need tweaks)",
    "hotfix for user logout issue",
    "tried to fix the css alignment",
    "this should fix the bug hopefully",
    "renamed variables for better naming",
    "added comments to the code",
    "removed a console.log i left in",
    "trying another approach for auth",
    "forgot to import something, fixed now",
    "pushing so I don’t lose my changes",
    "pls ignore this commit",
    "moved some files around for org",
    "final fix for that weird bug (I hope)",
    "added feature, but not tested yet",
    "update: forgot to add the new route",
    "making things work better (kinda)",
    "small tweak for mobile responsiveness",
    "ugh fixing merge conflicts again",
    "I think it’s fixed this time...",
    "more debugging, logs added",
    "disabled the feature for now",
    "added new file for testing only",
    "commit before lunch, will check later",
    "hotfix for quick deploy issue",
]

# Generate random commit date
def generate_random_date():
    random_days = random.randint(0, (END_DATE - START_DATE).days)
    random_time = random.randint(0, 86400)  # Seconds in a day
    return START_DATE + timedelta(days=random_days, seconds=random_time)

# Add and backdate commits
def add_backdated_commits():
    for i in range(NUM_COMMITS):
        # Generate a random commit date
        commit_date = generate_random_date()
        commit_date_str = commit_date.strftime("%Y-%m-%dT%H:%M:%S")

        # Pick a random commit message
        commit_message = random.choice(COMMIT_MESSAGES)

        # Create a dummy file for the commit
        filename = f"file_{i + 1}.txt"
        with open(filename, "w") as file:
            file.write(f"This is commit {i + 1} on {commit_date.strftime('%Y-%m-%d')}.")

        # Stage the file
        subprocess.run(["git", "add", filename], check=True)

        # Commit with a backdated timestamp (preserving author name and email)
        env = {
            "GIT_AUTHOR_DATE": commit_date_str,
            "GIT_COMMITTER_DATE": commit_date_str,
        }
        subprocess.run(
            ["git", "commit", "-m", commit_message],
            env={**os.environ, **env},
            check=True,
        )

    print(f"{NUM_COMMITS} backdated commits have been added.")

# Run the script
if __name__ == "__main__":
    add_backdated_commits()