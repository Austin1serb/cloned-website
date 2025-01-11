import subprocess
import random
from datetime import datetime, timedelta

# Generate a new random date, skipping Sundays
def generate_next_date(previous_date):
    while True:
        # Increment the date by 1 to 3 days randomly
        random_days = random.randint(1, 3)
        new_date = previous_date + timedelta(days=random_days)
        # Check if the day is not Sunday (Sunday is 6 in Python's weekday())
        if new_date.weekday() != 6:
            return new_date

# Rewrite commit history with random, chronologically ordered dates
def rewrite_commit_dates():
    # Ensure git-filter-repo is installed
    try:
        subprocess.run(["git", "filter-repo", "--version"], check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError:
        print("Error: git-filter-repo is not installed. Please install it first.")
        return

    # Get a list of all commits (in topological order)
    result = subprocess.run(["git", "rev-list", "--reverse", "HEAD"], capture_output=True, text=True)
    commit_hashes = result.stdout.strip().split("\n")

    if not commit_hashes:
        print("No commits found.")
        return

    # Start the date generation from a fixed point (e.g., YYYY MM, DD)
    current_date = datetime(2021, 10, 1)

    # Prepare a mapping of commit hashes to new dates
    commit_date_map = {}
    for commit_hash in commit_hashes:
        # Generate the next date, ensuring it doesn't fall on a Sunday
        current_date = generate_next_date(current_date)
        commit_date_map[commit_hash] = current_date.strftime("%Y-%m-%dT%H:%M:%SZ")

    # Create the commit callback script for git-filter-repo
    callback_script = "import datetime\n"
    callback_script += "def commit_callback(commit):\n"
    for commit_hash, new_date in commit_date_map.items():
        callback_script += f"    if commit.original_id == b'{commit_hash}':\n"
        callback_script += f"        commit.author_date = '{new_date}'\n"
        callback_script += f"        commit.committer_date = '{new_date}'\n"

    # Write the callback script to a temporary file
    with open("commit_callback.py", "w") as f:
        f.write(callback_script)

    # Run git-filter-repo with the generated callback script and --force flag
    try:
        subprocess.run(
            ["git", "filter-repo", "--commit-callback", "commit_callback.py", "--force"],
            check=True
        )
        print("Commit dates successfully rewritten, excluding Sundays.")
    except subprocess.CalledProcessError as e:
        print(f"Error rewriting commit history: {e}")

# Run the script
if __name__ == "__main__":
    rewrite_commit_dates()