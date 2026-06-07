import assert from "node:assert/strict";
import test from "node:test";
import { convertFileSize, getFileType, getFileTypesParams } from "./file-utils";

test("getFileType maps common extensions to storage categories", () => {
  assert.deepEqual(getFileType("report.pdf"), {
    type: "document",
    extension: "pdf",
  });
  assert.deepEqual(getFileType("photo.WEBP"), {
    type: "image",
    extension: "webp",
  });
  assert.deepEqual(getFileType("clip.mp4"), {
    type: "video",
    extension: "mp4",
  });
  assert.deepEqual(getFileType("audio.flac"), {
    type: "audio",
    extension: "flac",
  });
  assert.deepEqual(getFileType("archive.7z"), {
    type: "other",
    extension: "7z",
  });
});

test("convertFileSize formats byte values with expected units", () => {
  assert.equal(convertFileSize(512), "512 Bytes");
  assert.equal(convertFileSize(2048), "2.0 KB");
  assert.equal(convertFileSize(5 * 1024 * 1024), "5.0 MB");
  assert.equal(convertFileSize(3 * 1024 * 1024 * 1024), "3.0 GB");
});

test("getFileTypesParams maps route segments to query file types", () => {
  assert.deepEqual(getFileTypesParams("documents"), ["document"]);
  assert.deepEqual(getFileTypesParams("images"), ["image"]);
  assert.deepEqual(getFileTypesParams("media"), ["video", "audio"]);
  assert.deepEqual(getFileTypesParams("others"), ["other"]);
  assert.deepEqual(getFileTypesParams("unexpected"), ["document"]);
});
