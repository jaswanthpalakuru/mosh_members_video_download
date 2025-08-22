const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// Headers configuration - Updated with fresh cookies
const getCookieString = () =>
  "_gcl_au=1.1.1638038122.1755885669; prism_89545604=82eab86f-e34c-4a10-ab0f-b3beb275581a; ahoy_visitor=5f28f78c-739c-41d5-867c-0ded3ed94f90; ahoy_visit=4b7fd009-4a15-4407-8671-dca37c1dc25b; ahoy_track=true; _afid=5f28f78c-739c-41d5-867c-0ded3ed94f90; aid=5f28f78c-739c-41d5-867c-0ded3ed94f90; sk_t22ds596_access=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJ1c2VyIiwiaWF0IjoxNzU1ODg1ODEzLCJqdGkiOiIyMDNjYTM1NS01Y2IzLTRhN2ItYmQwYS1jODkzZDdmNjM1YjAiLCJpc3MiOiJza190MjJkczU5NiIsInN1YiI6ImM4MjUyNmJmLTc5MjctNDY1YS05OGNmLTVlOGJjY2E2OTI0NyJ9.jp1jO8H5Tsb6koIrM-046lHBHDPsqa2afOXCUVXSavI; sk_t22ds596_remember_me=1; signed_in=true; _session_id=f14c454b4d9a9748de15876532cc71da; site_preview=logged_in; ac_enable_tracking=1; aid=5f28f78c-739c-41d5-867c-0ded3ed94f90; ajs_group_id=null; ajs_user_id=%2221855059%22; ajs_anonymous_id=%22269ddb68-5723-4d55-be3e-6cc6cb81179d%22; _ga=GA1.1.1590708774.1755885825; _fbp=fb.1.1755885825106.32974832979751960; __ssid=3ccbaf945b6e54736fa5254c945adca; __stripe_mid=657319e2-bd97-404f-b3df-1554c25515d799d995; __stripe_sid=a5341a7f-bfbe-4914-8c9e-da9dd89fce68972cac; _hp2_ses_props.318805607=%7B%22r%22%3A%22https%3A%2F%2Fsso.teachable.com%2F%22%2C%22ts%22%3A1755885824573%2C%22d%22%3A%22members.codewithmosh.com%22%2C%22h%22%3A%22%2F%22%7D; zcglobal_cookie_optOut=%7B%22zc_optOut%22%3Atrue%2C%22essential%22%3Atrue%2C%22functional%22%3Atrue%2C%22analytics%22%3Atrue%7D; zpcc27afbc000de464487fe2d78f7ee5867=2; zabUserId=1755885968684zabu0.28325779616002567; zscc27afbc000de464487fe2d78f7ee5867=1755885968702zsc0.8200940646773475; zft-sdc=isef%3Dtrue-isfr%3Dtrue-source%3Ddirect; cf_clearance=bnPQcydXsR.k_wEfwJRngPA8XFs1E2eDCpIrMaosMrU-1755888763-1.2.1.1-hwDYL1P5aF3xvctqb.B1VnoYSY12Xd_M4hAVbhipfY11MFAyQ1_oaRBcOST8GPl5QZT72JqU93SjG40Vl_IJAEcF4srqP5wpnJa0VtZb9dD7Qz3HMIn.t.HcDbwb66el1fNg9GMKu9MARH0Acqoz7ilsqI5RczLh75onyFb4e.iJm6cjJaB8gQrOp_vaglJqO9rEX784cQglMqIK.rNgojXDe.m1or6pS2pj4g0iWyw; zps-tgr-dts=sc%3D1-expAppOnNewSession%3D%5B%5D-pc%3D60-sesst%3D1755885968704; _hp2_id.318805607=%7B%22userId%22%3A%226126112452843539%22%2C%22pageviewId%22%3A%222240833198739044%22%2C%22sessionId%22%3A%222089970112647912%22%2C%22identity%22%3Anull%2C%22trackerVersion%22%3A%224.0%22%7D; _ga_SL8LSCXHSV=GS2.1.s1755885824$o1$g1$t1755888788$j42$l0$h0; _ga_E720JHXSJ2=GS2.1.s1755885824$o1$g1$t1755888788$j43$l0$h0; zps-tgr-dts=sc%3D1-expAppOnNewSession%3D%5B%5D-pc%3D62-sesst%3D1755885968704";

// Headers for Layabout API (course structure)
const getLayaboutHeaders = () => ({
});

// Headers for HTML pages
const getHeaders = () => ({
});

// Headers for private video API
const getApiHeaders = () => ({});

// Step 1: Get course structure from Layabout API
async function fetchCourseStructure(courseId) {
  try {
    console.log(`Fetching course structure for ID: ${courseId}`);
    const layaboutUrl = `https://members.codewithmosh.com/layabout/courses/${courseId}`;
    const response = await axios.get(layaboutUrl, {
      headers: getLayaboutHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch course structure: ${error.message}`);
  }
}

// Step 2: Extract lecture IDs from JSON structure
function extractLectureIdsFromJSON(courseData) {
  const lectures = [];
  let orderIndex = 1;

  // Look for course structure in the response
  if (courseData && courseData.course) {
    const course = courseData.course;

    // Check if syllabus exists
    if (course.syllabus && Array.isArray(course.syllabus)) {
      course.syllabus.forEach((section, sectionIndex) => {
        if (section && section.lectures && Array.isArray(section.lectures)) {
          section.lectures.forEach((lecture, lectureIndex) => {
            // Look for lectures in lectures array
            if (lecture && lecture.id) {
              let title = "Untitled Lecture";

              // Try different ways to get the title
              if (lecture.name) {
                title = lecture.name;
              } else if (lecture.title) {
                title = lecture.title;
              } else {
                title = `Lecture ${lecture.id}`;
              }

              // Clean up title for filename
              title = title
                .replace(/[<>:"/\\|?*]/g, "")
                .replace(/\s+/g, " ")
                .trim();

              lectures.push({
                id: lecture.id.toString(),
                title: title,
                order: orderIndex++,
                sectionName: section.name || `Section ${sectionIndex + 1}`,
                lectureType: lecture.type || "unknown",
              });
            }
          });
        }
      });
    }
  }

  console.log(`Found ${lectures.length} lectures in course structure`);

  // Debug: if no lectures found, show structure
  if (lectures.length === 0) {
    console.log("Debugging course structure...");
    if (courseData && courseData.course) {
      console.log("Course object exists");
      if (courseData.course.syllabus) {
        console.log(
          `Syllabus has ${courseData.course.syllabus.length} sections`
        );
        console.log(
          "First few sections:",
          courseData.course.syllabus.slice(0, 2).map((s) => ({
            name: s.name,
            itemsCount: s.items ? s.items.length : 0,
            firstItem: s.items && s.items[0] ? Object.keys(s.items[0]) : [],
          }))
        );
      } else {
        console.log("No syllabus found in course");
        console.log(
          "Available keys in course:",
          Object.keys(courseData.course)
        );
      }
    }
  }

  return lectures;
}

// Helper function to get course ID from course name using known mappings
async function findCourseId(courseName) {
  console.log(`🔍 Looking up course ID for: ${courseName}`);

  // Known course mappings - we'll build this up as we find more courses
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

  // Check if we have a direct mapping
  if (courseMap[courseName]) {
    const courseId = courseMap[courseName];
    console.log(`✅ Found course ID: ${courseId}`);
    return courseId;
  }

  // If not found, try to auto-discover by attempting common patterns
  console.log(`🔄 Course ID not mapped. Attempting auto-discovery...`);

  try {
    // Try to access the course page first to verify it exists
    const courseUrl = `https://members.codewithmosh.com/courses/${courseName}`;
    const response = await axios.get(courseUrl, { headers: getHeaders() });

    if (response.status === 200) {
      // Course exists, but we need to find the ID
      console.log(`📄 Course page found, but ID not mapped.`);
      console.log(`Please help us discover the course ID:`);
      console.log(`1. Open: ${courseUrl}`);
      console.log(`2. Open browser dev tools (F12) → Network tab`);
      console.log(
        `3. Refresh the page and look for requests to "layabout/courses/XXXXXX"`
      );
      console.log(`4. The XXXXXX number is the course ID`);
      console.log(`5. Add it to the courseMap in the script`);

      throw new Error(
        `Course ID not mapped for: ${courseName}. Please find and add the course ID using the steps above.`
      );
    }
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(
        `Course not found: ${courseName}. Please check the course name.`
      );
    }

    // If it's our custom error message, re-throw it
    if (error.message.includes("Course ID not mapped")) {
      throw error;
    }

    throw new Error(`Failed to access course: ${error.message}`);
  }
}

// Step 3: Fetch individual lecture page to get HTML with attachment ID
async function fetchLecturePage(lectureId, lectureUrl) {
  try {
    console.log(`Fetching lecture HTML: ${lectureUrl}`);
    const response = await axios.get(lectureUrl, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.log(`Failed to fetch lecture ${lectureId}: ${error.message}`);
    return null;
  }
}

function extractAttachmentId(html) {
  // Look for attachment_id in various patterns - more comprehensive search
  const patterns = [
    /attachment_id['"]\s*:\s*['"]?(\d+)['"]?/i,
    /data-attachment-id=['"](\d+)['"]/i,
    /"attachment_id":\s*"?(\d+)"?/i,
    /attachment_id=(\d+)/i,
    /'attachment_id':\s*'?(\d+)'?/i,
    /attachment_id:\s*(\d+)/i,
    /"attachment_id":(\d+)/i,
    /attachment_id\s*=\s*"(\d+)"/i,
    /attachment_id\s*=\s*'(\d+)'/i,
    // More specific patterns for Mosh's site
    /window\.attachment_id\s*=\s*['"]?(\d+)['"]?/i,
    /var\s+attachment_id\s*=\s*['"]?(\d+)['"]?/i,
    /const\s+attachment_id\s*=\s*['"]?(\d+)['"]?/i,
    /let\s+attachment_id\s*=\s*['"]?(\d+)['"]?/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      console.log(`  → Found attachment ID with pattern: ${pattern}`);
      return match[1];
    }
  }

  // Also try to find it in script tags
  const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gis);
  if (scriptMatches) {
    for (const script of scriptMatches) {
      for (const pattern of patterns) {
        const match = script.match(pattern);
        if (match) {
          console.log(`  → Found attachment ID in script tag`);
          return match[1];
        }
      }
    }
  }

  console.log(`  → No attachment ID found with any pattern`);
  return null;
}

async function getVideoUrl(attachmentId, lectureId, courseId) {
  try {
    if (!attachmentId || !lectureId || !courseId) {
      throw new Error("attachmentId, lectureId, and courseId are required");
    }

    // Build the same URL that the "Download" button uses
    const downloadUrl = `https://members.codewithmosh.com/courses/${courseId}/lectures/${lectureId}/hotmart_lecture_video_download_link/${attachmentId}`;

    return downloadUrl;
  } catch (error) {
    throw new Error(`Failed to build download URL: ${error.message}`);
  }
}

async function downloadVideo(videoUrl, filename, outputDir) {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Handle m3u8 playlist files - these need special handling
    if (videoUrl.includes(".m3u8")) {
      console.log(
        `  → Warning: m3u8 playlist detected. This requires special streaming download.`
      );
      console.log(`  → Skipping for now. URL: ${videoUrl}`);
      throw new Error("m3u8 streaming videos not yet supported");
    }

    const response = await axios.get(videoUrl, {
      responseType: "stream",
      headers: {
      },
    });

    console.log("response -------------------------", response);
    // Determine file extension
    let extension = ".mp4";
    const contentType = response.headers["content-type"] || "";
    if (contentType.includes("video/mp4") || videoUrl.includes(".mp4")) {
      extension = ".mp4";
    } else if (contentType.includes("video/avi") || videoUrl.includes(".avi")) {
      extension = ".avi";
    } else if (contentType.includes("video/mov") || videoUrl.includes(".mov")) {
      extension = ".mov";
    }

    const fullFilename = `${filename}${extension}`;
    const filepath = path.join(outputDir, fullFilename);

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    return fullFilename;
  } catch (error) {
    throw new Error(`Failed to download video: ${error.message}`);
  }
}

async function downloadCourse(courseName, outputDir = "downloads") {
  try {
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Step 1: Find course ID from course name
    const courseId = await findCourseId(courseName);

    // Step 2: Fetch course structure from Layabout API
    console.log(`Fetching course structure with ID: ${courseId}`);
    const courseData = await fetchCourseStructure(courseId);

    // Get course display name from the API response for folder naming
    const courseDisplayName = courseData.course?.name || `course_${courseId}`;
    const safeCourseFolder = courseDisplayName
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/\s+/g, "_");

    const courseDir = path.join(outputDir, safeCourseFolder);
    if (!fs.existsSync(courseDir)) {
      fs.mkdirSync(courseDir, { recursive: true });
    }

    console.log(`Course: ${courseDisplayName}`);

    // Step 2: Extract lecture IDs from JSON structure
    const lectures = extractLectureIdsFromJSON(courseData);

    if (lectures.length === 0) {
      console.log("No lectures found in course structure");
      return;
    }

    console.log(`Starting download of ${lectures.length} lectures...`);
    let successCount = 0;

    // Step 3: Process each lecture
    for (const lecture of lectures) {
      try {
        console.log(
          `\n[${lecture.order}/${lectures.length}] Processing: ${lecture.title} (ID: ${lecture.id})`
        );

        // Get lecture page HTML - we need the course URL slug, not the display name
        // For now, we'll try to construct it from the course ID or use a fallback
        const courseSlug = courseData.course?.slug || `course_${courseId}`;
        const lectureUrl = `https://members.codewithmosh.com/courses/${courseSlug}/lectures/${lecture.id}`;
        const lectureHtml = await fetchLecturePage(lecture.id, lectureUrl);
        if (!lectureHtml) {
          console.log(`  ✗ Failed to fetch lecture page`);
          continue;
        }

        // Extract attachment ID from HTML
        const attachmentId = extractAttachmentId(lectureHtml);
        if (!attachmentId) {
          console.log(`  ✗ No attachment ID found in HTML`);
          continue;
        }

        console.log(`  → Found attachment ID: ${attachmentId}`);

        // Get video URL using private_video API
        const videoUrl = await getVideoUrl(attachmentId, lecture.id, courseId);
        console.log(`  → Got video URL, downloading...`);

        // Download video
        const filename = `${lecture.order.toString().padStart(2, "0")} - ${
          lecture.title
        }`;
        const downloadedFile = await downloadVideo(
          videoUrl,
          filename,
          courseDir
        );

        console.log(`  ✓ Downloaded: ${downloadedFile}`);
        successCount++;
      } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
      }
    }

    console.log(
      `\n🎉 Download complete! ${successCount}/${lectures.length} videos downloaded successfully.`
    );
    console.log(`📁 Videos saved to: ${courseDir}`);
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
  }
}

// Example usage
async function main() {
  // Example course name - just the course identifier
  const courseName = "the-ultimate-typescript-1";

  await downloadCourse(courseName);
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fetchCourseStructure,
  extractLectureIdsFromJSON,
  fetchLecturePage,
  extractAttachmentId,
  getVideoUrl,
  downloadVideo,
  downloadCourse,
  findCourseId,
};
