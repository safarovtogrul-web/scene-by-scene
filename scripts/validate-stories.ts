import { validateRegisteredStories } from "../lib/story-packages/validate-files";
import { STORY_PACKAGES } from "../lib/story-packages/registry";

validateRegisteredStories();
console.log(`Validated ${STORY_PACKAGES.length} production story package(s), including local image files.`);
