const readline = require("readline");
const { downloadCourse } = require("./course_downloader");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("🎓 Mosh Course Video Downloader");
  console.log("================================\n");

  try {
    const courseMap = {
      "the-ultimate-typescript-1": "1779784", // done
      "python-programming-course-beginners-1": "417695", // done
      "complete-sql-mastery-1": "525068", // done
      "the-ultimate-django-part1-1": "1422300",
      "the-ultimate-django-part2-1": "1522608",
      "the-ultimate-django-part3-1": "1604024",
      "the-ultimate-docker-course-1": "1359863",
      "the-ultimate-react-native-course-part1-1": "887220",
      "the-ultimate-react-native-course-part2-1": "955852",
      "ultimate-react-part1-1": "2037633",
      "ultimate-react-part2-1": "2074069",
      "complete-react-testing-course": "2456306",
      "mastering-next-js-13-with-typescript-1": "2178940",
      "nextjs-projects-issue-tracker": "2187934",
      "data-structures-algorithms-part1-1": "639884",
      "data-structures-algorithms-part-2-1": "650827",
      "data-structures-algorithms-part-3-1": "680168",
    };
    const keys = Object.keys(courseMap);
    for (let i = 0; i < keys.length; i++) {
      // Get course name from user
      const courseName = keys[i];

      if (!courseName) {
        console.log("❌ Course name is required!");
        rl.close();
        return;
      }

      // │ > in the html yo will only get the attchment id from that you have to attach that id to private video url and the ndownload in html there is no direct url

      console.log(`\n📚 Course: ${courseName}`);

      // Ask for custom output directory (optional)
      const customDir = "downloads";
      const outputDir = customDir || "downloads";

      console.log(`\n📁 Videos will be saved to: ${outputDir}/[course-name]/`);
      console.log("\n🚀 Starting download...\n");

      // Start download with course name
      await downloadCourse(courseName, outputDir);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\n\n👋 Download cancelled by user");
  rl.close();
  process.exit(0);
});

// Run the app
main().catch(console.error);
