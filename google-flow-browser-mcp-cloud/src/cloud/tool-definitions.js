// Tool definitions for the cloud edition of the Google Flow MCP server.
// The 36 original definitions are copied verbatim from the original server
// (same names, same input schemas) except for description wording that said
// "launch Chrome / CDP / dedicated profile" — this edition has no local Chrome:
// browser work runs in the signed-in cloud browser via the task queue.
// New tools appended in this edition: flow_generate_batch, flow_cloud_complete,
// flow_cloud_result, and flow_switch_account (3-account rotation, 2026-11-13).

export const TOOL_DEFINITIONS = [
  {
    "name": "flow_connect",
    "description": "Connect to Google Flow in the signed-in cloud browser (no local Chrome, no CDP). Returns the cloud context and queues a verification task for the agent to run in the cloud browser window.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "headless": {
          "type": "boolean",
          "description": "Launch in headless mode (not recommended, Google Flow needs visible browser).",
          "default": false
        },
        "open_flow": {
          "type": "boolean",
          "description": "Auto-navigate to Google Flow after connection.",
          "default": true
        }
      }
    }
  },
  {
    "name": "flow_disconnect",
    "description": "Clear the cloud connection record. The cloud browser window itself stays open and signed in.",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "flow_status",
    "description": "Check current connection status: cloud browser window, Flow page loaded, account verified, job queue state. Cloud edition: the status is gathered by the agent in the signed-in cloud browser via the task queue.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "full": {
          "type": "boolean",
          "description": "Return full status with screenshot.",
          "default": false
        }
      }
    }
  },
  {
    "name": "flow_account_check",
    "description": "Verify the signed-in Google account in the cloud browser matches the active rotation account (agent-executed task queue). A verified result updates the local verified-account record. Pass balance_read=true to also read the active account's credit balance.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "balance_read": {
          "type": "boolean",
          "description": "Also read the active account's credit balance chip.",
          "default": false
        },
        "account": {
          "type": "string",
          "description": "Email to verify instead of the active account (must be one of the configured rotation accounts)."
        }
      }
    }
  },
  {
    "name": "flow_accounts",
    "description": "Google Flow accounts (3-account rotation: #1 you@example.com, #2 shohreh.hassani1968@gmail.com, #3 drtalebikids@gmail.com). Shows which account is active, last-read balances, exhausted flags/times and recent switches. Paid calls read the active balance first; when it cannot cover the next generation the rotation moves FORWARD to the next account (no monthly reset back to #1). refresh_active=true queues a balance-read task in the cloud browser (no CDP) and returns the last-read balance with a note. cost_estimate=<credits> adds a cost check: which accounts can cover that many credits and which to switch to first.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "refresh_active": {
          "type": "boolean",
          "description": "Read the active account's live \"<N> Google Flow credits\" (needs flow_connect).",
          "default": false
        },
        "cost_estimate": {
          "type": "number",
          "description": "Estimated credits for the next generation. Adds a cost_check: per-account can_cover and the recommended account to switch to first."
        }
      }
    }
  },
  {
    "name": "flow_switch_account",
    "description": "Switch the active Google Flow account in the signed-in cloud browser to another rotation account (agent-executed task queue). The three accounts are all signed in to the same Google session, so this navigates to the target account's Flow (via its /u/N/ URL or the account switcher), verifies the account chip shows the target account, and reads its credit balance. It never signs anyone in or out. Switching changes which Flow projects are visible: each account has its own projects, and \"Acme Test\" exists only on #1 (you@example.com). A verified switch updates the local active-account record. Spends no credits and needs no approval.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "account_index": {
          "type": "integer",
          "description": "Rotation index to switch to: 1 = you@example.com, 2 = shohreh.hassani1968@gmail.com, 3 = drtalebikids@gmail.com."
        },
        "email": {
          "type": "string",
          "description": "Email of the rotation account to switch to (alternative to account_index)."
        }
      }
    }
  },
  {
    "name": "flow_discover_ui",
    "description": "Open a Google Flow page and record its interactive elements into config/selectors.map.json (reuses the open or most recent project; Grid Architect opens its tool frame). Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "page": {
          "type": "string",
          "description": "Page to discover: main, project, image-generation, video-generation, characters, scenes, tools-gallery, grid-architect.",
          "default": "main"
        }
      },
      "required": [
        "page"
      ]
    }
  },
  {
    "name": "flow_generate_image",
    "description": "Generate images in DIRECT mode (Agent OFF — never use the Flow Agent; the user's standing rule, 2026-11-13). By default (auto_confirm=false) it only reports the direct settings it WOULD apply - nothing is sent. With auto_confirm=true it sets the direct settings (model/ratio/quantity), types the prompt with human-like timing, sends it (0 credits for Nano Banana 2.1 / 2 Lite / Pro in Flow), waits, and downloads every result as a file. Image models only; prompts asking for video are refused. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "prompt": {
          "type": "string",
          "description": "The text prompt for image generation (max 4000 chars)."
        },
        "model": {
          "type": "string",
          "description": "Nano Banana 2.1 (default; \"Nano Banana 2\" is accepted as an alias), Nano Banana Pro, or Nano Banana 2 Lite.",
          "default": "Nano Banana 2.1"
        },
        "auto_confirm": {
          "type": "boolean",
          "description": "false (default): prepare only, spend nothing. true: send to the agent and download the results (may use credits).",
          "default": false
        },
        "ratio": {
          "type": "string",
          "description": "Aspect ratio: 16:9, 4:3, 1:1, 3:4, 9:16.",
          "default": "1:1"
        },
        "quantity": {
          "type": "number",
          "description": "How many images (1-4).",
          "default": 1
        },
        "reference_images": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Local assets uploaded to the project and attached as ingredients: images (jpg/png/webp, max 20 MB) or videos (mp4/mov/webm, max 200 MB); max 4."
        },
        "output_folder": {
          "type": "string",
          "description": "Folder for the downloaded files (default: outputs/images)."
        },
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign (e.g. \"summer-2026\")."
        }
      },
      "required": [
        "prompt"
      ]
    }
  },
  {
    "name": "flow_generate_video",
    "description": "Generate video in DIRECT mode (Agent OFF — never use the Flow Agent; the user's standing rule, 2026-11-13). auto_confirm=false (default) only reports the direct settings it WOULD apply - nothing is sent and no credits are used. With auto_confirm=true it sets the direct settings (model/ratio/duration), uploads and attaches any reference assets, types the prompt with human-like timing, sends it, waits for the clip and downloads it. The quick-settings popover's \"Generating will use N credits\" footer is the cost contract. Default model is Omni 1.1 Flash (the user's standing rule, 2026-11-13: 4s = 7 credits, 6s = 10, 8s = 12, 10s = 15; quality still very good); Omni 1.2 Flash bills 3 credits per second at 720p (12 for a 4s clip, 30 for 10s, 60 for the full 15s). Veo 3.1 - Quality (~100) is refused unless allow_expensive=true. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "prompt": {
          "type": "string",
          "description": "The text prompt for video generation (max 4000 chars)."
        },
        "model": {
          "type": "string",
          "description": "Omni 1.1 Flash (default, the user's standing rule 2026-11-13: 4s = 7 credits, 6s = 10, 8s = 12, 10s = 15; retires 2026-12-05). Omni 1.2 Flash (3 credits per second at 720p), Veo 3.1 - Lite (10 flat), Veo 3.1 - Fast (20 flat, retiring 2026-12-05) and Veo 3.1 - Quality (~100 flat, retiring 2026-12-05, needs allow_expensive=true). Shortcuts: default/cheap = Omni 1.1, flash/omni = Omni 1.2, legacy, lite, fast, quality.",
          "default": "Omni 1.1 Flash"
        },
        "auto_confirm": {
          "type": "boolean",
          "description": "false (default): prepare only, spend nothing. true: send, wait and download (uses credits).",
          "default": false
        },
        "ratio": {
          "type": "string",
          "description": "Aspect ratio: 16:9 or 9:16.",
          "default": "16:9"
        },
        "quantity": {
          "type": "number",
          "description": "How many clips (1-4).",
          "default": 1
        },
        "duration": {
          "type": "number",
          "description": "Target length in seconds and sent as \"Video length: N seconds.\" in the prompt. Omni 1.2 Flash accepts any whole second from 3 to 15 (subscribers); Veo 3.1 snaps to 4/6/8 and Omni 1.1 to 4/6/8/10. Longer than 15s needs Extend in the Flow UI or a local flow_stitch_videos."
        },
        "reference_images": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Local assets to upload and attach as ingredients: images (jpg/png/webp, max 20 MB) or videos (mp4/mov/webm, max 200 MB); max 4."
        },
        "allow_expensive": {
          "type": "boolean",
          "description": "Required to pick a premium model listed in config.expensiveVideoModels (Veo 3.1 - Quality, ~100 credits).",
          "default": false
        },
        "output_folder": {
          "type": "string",
          "description": "Folder for the downloaded clip (default: outputs/videos)."
        },
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign (e.g. \"summer-2026\")."
        }
      },
      "required": [
        "prompt"
      ]
    }
  },
  {
    "name": "flow_generate_batch",
    "description": "Generate a whole Reel's clips in ONE cloud-browser task instead of one task per clip: up to 4 clips, each with its own prompt (and optional reference images, model, ratio, duration), run in order in the signed-in cloud browser and downloaded one by one. Uses DIRECT generation (Agent mode off) for every clip — the reliable path, with the quick-settings popover (model, ratio, resolution, Length slider) and the \"Generating will use N credits\" footer as the cost contract; if direct mode ever fails for a clip, the assignment falls back to the agent for that clip only. auto_confirm=true is required (a batch always spends credits); the total estimate is the sum of the clips and needs Muse's approval before the task runs. Default model is Omni 1.1 Flash (4s = 7 credits). Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete, one result object with a per-clip list.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "clips": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "label": {
                "type": "string",
                "description": "Short label for this clip (e.g. \"A hook\", \"B print reveal\") — used in the report, not sent to Flow."
              },
              "prompt": {
                "type": "string",
                "description": "The text prompt for this clip (max 4000 chars)."
              },
              "model": {
                "type": "string",
                "description": "Model for this clip; defaults to Omni 1.1 Flash. Same options as flow_generate_video."
              },
              "ratio": {
                "type": "string",
                "description": "Aspect ratio for this clip: 16:9 or 9:16.",
                "default": "9:16"
              },
              "duration": {
                "type": "number",
                "description": "Target length in seconds for this clip. Omni 1.1 snaps to 4/6/8/10; Omni 1.2 accepts any whole second from 3 to 15."
              },
              "reference_images": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Local assets to upload and attach as ingredients for this clip (max 4)."
              }
            },
            "required": ["prompt"]
          },
          "description": "The clips to generate, in order (1-4 clips)."
        },
        "auto_confirm": {
          "type": "boolean",
          "description": "Must be true: a batch always spends credits. The summed estimate is shown and needs approval before the task runs.",
          "default": false
        },
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign."
        }
      },
      "required": ["clips", "auto_confirm"]
    }
  },
  {
    "name": "flow_video_options",
    "description": "Read-only cheat sheet for Flow video models: which are live, which retire on 2026-12-05, each model's allowed clip lengths, its capabilities (video-to-video, extend, ingredients) and its Flow-credit cost at 720p. Free and instant — no browser, no credits. Call this before flow_generate_video when you are unsure which model or length to use.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "model": {
          "type": "string",
          "description": "Optional single model to describe, e.g. \"Omni 1.2 Flash\" or \"Veo 3.1 - Lite\". Omit for the full list."
        }
      }
    }
  },
  {
    "name": "flow_edit_video",
    "description": "Turn an existing video into a NEW video with Flow's Omni video-to-video edit: the clip is loaded into Flow's editor and the change is described in prose. Staged by default - auto_confirm=false only types the prompt, so nothing is sent and no credits are used. With auto_confirm=true it sends the edit, answers Flow's permission card with \"Approve\" (never \"Always approve\"), waits for the new version and downloads it. Omni is the only model that offers video-to-video and Omni 1.2 bills per second at 720p: 3 credits per second, so about 12 for a 4s source clip. Edits can be chained conversationally on the same clip (each turn is billed). Source clip: source_file (uploaded first), source_media_id, or the newest finished clip in the project. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "edit_prompt": {
          "type": "string",
          "description": "How to change the clip, e.g. \"add gentle rain and make the lantern glow warm orange\"."
        },
        "source_file": {
          "type": "string",
          "description": "Local clip to upload first (mp4/m4v/mov/3gp/avi, max 200 MB)."
        },
        "source_media_id": {
          "type": "string",
          "description": "Media id of a clip already in the project (the last id in /project/<project>/edit/<media id>)."
        },
        "auto_confirm": {
          "type": "boolean",
          "description": "false (default): type the prompt only, spend nothing. true: run the edit (Omni 1.2, 3 credits per second at 720p) and download the new version.",
          "default": false
        },
        "output_folder": {
          "type": "string",
          "description": "Folder for the downloaded clip (default: outputs/videos)."
        },
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign (e.g. \"summer-2026\")."
        }
      },
      "required": [
        "edit_prompt"
      ]
    }
  },
  {
    "name": "flow_stitch_videos",
    "description": "Join several local clips into one longer video with ffmpeg: normalises every clip to a single canvas and frame rate, then joins them with hard cuts or a crossfade. Optionally re-frames to an aspect ratio (9:16 for Reels/Shorts), adds background music, or burns in an .srt subtitle file. Flow's own Extend (Omni Extend, subscribers, +3-10s at a time) exists in the UI but has no MCP tool yet, and Omni 1.2 Flash already generates 3-15s natively, so use this to join, reframe and finish anything longer than one clip. Runs locally and instantly: no credits, no queue.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "files": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Local video paths, in playback order (at least two)."
        },
        "output_name": {
          "type": "string",
          "description": "Output file name without extension (default: stitch-<timestamp>)."
        },
        "transition": {
          "type": "string",
          "enum": [
            "crossfade",
            "cut"
          ],
          "description": "crossfade (default) or cut for hard joins."
        },
        "transition_seconds": {
          "type": "number",
          "description": "Crossfade length in seconds, 0.2-3 (default 0.6)."
        },
        "aspect": {
          "type": "string",
          "enum": [
            "16:9",
            "9:16",
            "1:1",
            "4:3",
            "3:4"
          ],
          "description": "Optional target aspect; clips are scaled and padded to fit it."
        },
        "max_height": {
          "type": "number",
          "description": "Cap on the output height (default 1080); never upscales."
        },
        "music": {
          "type": "string",
          "description": "Optional audio file to lay under the whole piece."
        },
        "music_mode": {
          "type": "string",
          "enum": [
            "mix",
            "replace"
          ],
          "description": "mix with the clips' own audio (default) or replace it."
        },
        "music_volume": {
          "type": "number",
          "description": "Music volume when mixing, 0-1 (default 0.35)."
        },
        "subtitles": {
          "type": "string",
          "description": "Optional .srt file to burn into the video."
        },
        "subtitle_position": {
          "description": "'safe' (default): lift captions clear of the Reels/TikTok UI overlay (portrait: ends above ~64% of the height); 'bottom': plain libass bottom placement; or a number 0.05-0.8 = caption bottom edge as a fraction of the frame height measured from the bottom (0.42 sits between a speaker's chin and a chest logo).",
          "oneOf": [
            {
              "type": "string",
              "enum": [
                "safe",
                "bottom"
              ]
            },
            {
              "type": "number"
            }
          ]
        }
      },
      "required": [
        "files"
      ]
    }
  },
  {
    "name": "flow_qc_report",
    "description": "Pre-review QC of a finished video (local ffprobe/ffmpeg, free): codec, pixel format, aspect/resolution, constant fps, size, duration, audio format, black frames, frozen video, silence gaps, loudness (-14 LUFS target), true peak; writes a JSON report and a 6x4 contact sheet PNG. Hard checks decide pass/fail; it can NOT see garment/print/logo/hand artifacts, so a pass never means approved: look at the contact sheet.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "file": {
          "type": "string",
          "description": "Local video path."
        },
        "aspect": {
          "type": "string",
          "enum": [
            "9:16",
            "16:9",
            "1:1",
            "4:5",
            "3:4",
            "4:3"
          ],
          "description": "Expected aspect (default 9:16)."
        },
        "target_seconds": {
          "type": "number",
          "description": "Expected duration (±0.5s); omit to skip."
        },
        "max_mb": {
          "type": "number",
          "description": "File size limit in MB (default 500, TikTok ads)."
        },
        "target_lufs": {
          "type": "number",
          "description": "Integrated loudness target (default -14)."
        }
      },
      "required": [
        "file"
      ]
    }
  },
  {
    "name": "flow_analyze_beats",
    "description": "Detect the tempo and beat times of a local audio/video file (free, local ffmpeg + FFT; no Python). Accurate within ~30 ms for steady electronic/pop tracks, not for rubato music. Use it on a Flow Music track before cutting video to it.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "file": {
          "type": "string",
          "description": "Local audio or video path."
        },
        "min_bpm": {
          "type": "number",
          "description": "Lowest tempo to consider (default 70)."
        },
        "max_bpm": {
          "type": "number",
          "description": "Highest tempo to consider (default 180)."
        },
        "max_beats": {
          "type": "number",
          "description": "How many beat times to list (default 64)."
        }
      },
      "required": [
        "file"
      ]
    }
  },
  {
    "name": "flow_beat_sync",
    "description": "Cut video clips so every cut lands on a beat and lay a music track under them, loudness-normalised to -14 LUFS. Each clip is given a number of beats (default 4 = one bar); its start can be offset with from. The music starts at its first detected beat. Free, local. Output + a .beatsync.json sidecar with bpm, cut times and the plan.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "music": {
          "type": "string",
          "description": "Local music file (e.g. a Flow Music download)."
        },
        "clips": {
          "type": "array",
          "description": "In playback order.",
          "items": {
            "type": "object",
            "properties": {
              "file": {
                "type": "string"
              },
              "beats": {
                "type": "number",
                "description": "How many beats this clip shows (default 4)."
              },
              "from": {
                "type": "number",
                "description": "Start offset into the clip, seconds (default 0)."
              }
            },
            "required": [
              "file"
            ]
          }
        },
        "bpm": {
          "type": "number",
          "description": "Override the detected tempo."
        },
        "music_start": {
          "type": "number",
          "description": "Where in the music to start (default: first detected beat)."
        },
        "clip_audio_volume": {
          "type": "number",
          "description": "Volume of the clips' own audio, 0-1 (default 0.25; use ~1.0 when the clips have dialogue)."
        },
        "music_volume": {
          "type": "number",
          "description": "Music volume before mixing, 0-1 (default 1.0; ~0.5 under dialogue)."
        },
        "duck_music": {
          "type": "boolean",
          "description": "Sidechain-duck the music while the clips' audio (speech) is present."
        },
        "logo": {
          "type": "string",
          "description": "Optional transparent PNG for a beat-timed end card (e.g. the white Acme logo)."
        },
        "logo_beats": {
          "type": "number",
          "description": "How many final beats the end card lasts (default 4)."
        },
        "width": {
          "type": "number",
          "description": "Output width (default 720)."
        },
        "height": {
          "type": "number",
          "description": "Output height (default 1280)."
        },
        "fps": {
          "type": "number",
          "description": "Output fps (default 24)."
        },
        "output_name": {
          "type": "string"
        }
      },
      "required": [
        "music",
        "clips"
      ]
    }
  },
  {
    "name": "flow_motion_overlay",
    "description": "Draw motion graphics over a finished video, locally and free: kinetic words, brand badge, line callouts that point at the product, karaoke captions with the active word in orange, beat-pulsing dots, underline wipes, a logo/end-card. Rendered frame by frame from assets/motion/overlay.html in a separate headless Chrome, composited with ffmpeg. Positions are fractions of a 1080x1920 design space (x,y = centre); times in seconds, or in beats when `beats: {bpm,start}` is given with beat0/beat1. Returns a safe-zone audit (platform UI covers the top 14% and bottom 35%). This is what makes an AI clip read as an ad for the brand.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "video": {
          "type": "string",
          "description": "Local video to draw on (e.g. a flow_beat_sync output)."
        },
        "items": {
          "type": "array",
          "description": "Overlay elements. type: word {text,x,y,size,color,anim:pop|rise|wipe|type,font:mono?} | badge {text,x,y} | wordmark {src,x,y,width} | callout {text,target:[x,y],label:[x,y]} | line {from,to} | underline {x,y,width} | rect {color,maxOpacity} (dim/solid card) | pulse {x,y,r,beatList} | captions {words:[{w,t0,t1}],x,y,size,maxWords}. Each has t0/t1 or beat0/beat1.",
          "items": {
            "type": "object"
          }
        },
        "beats": {
          "type": "object",
          "description": "{ bpm, start }: start = second at which beat 0 falls; lets items use beat0/beat1/beatList."
        },
        "theme": {
          "type": "object",
          "description": "Override colours: ink, dim, orange (#FA7F14), bg."
        },
        "duration": {
          "type": "number",
          "description": "Render only the first N seconds (default whole video)."
        },
        "fps": {
          "type": "number",
          "description": "Overlay/output fps (default: source fps, max 30)."
        },
        "audit_at": {
          "type": "array",
          "items": {
            "type": "number"
          },
          "description": "Times for the safe-zone audit."
        },
        "output_name": {
          "type": "string"
        }
      },
      "required": [
        "video",
        "items"
      ]
    }
  },
  {
    "name": "flow_music_generate",
    "description": "Generate an instrumental in Flow Music (Lyria 3.5) from structured fields, in a Flow Music tab in the signed-in cloud browser (never the Flow tab). Costs ~5 credits per take and returns both takes. IMPORTANT: length and BPM are only hints - the Length field clamps to 1:00-3:00 and overshoots - so always download the WAV and cut it with flow_music_shorten. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "genre": {
          "type": "string",
          "description": "e.g. \"minimal deep house\", \"lo-fi hip hop\"."
        },
        "mood": {
          "type": "string"
        },
        "instruments": {
          "type": "string"
        },
        "bpm": {
          "type": "number"
        },
        "key": {
          "type": "string"
        },
        "target_sec": {
          "type": "number",
          "description": "Roughly how long the final bed should be; used for the brief and later by flow_music_shorten."
        },
        "avoid": {
          "type": "string",
          "description": "Comma list, e.g. \"vocals, long risers\"."
        },
        "prompt": {
          "type": "string",
          "description": "Extra free-text direction appended to the built prompt."
        },
        "instrumental": {
          "type": "boolean",
          "description": "Default true."
        },
        "lyrics": {
          "type": "string",
          "description": "Only when instrumental=false."
        },
        "length_sec": {
          "type": "number",
          "description": "Advanced > Length hint (clamped to 60-180 by the app)."
        },
        "seed": {
          "type": "number"
        },
        "via": {
          "type": "string",
          "enum": [
            "compose",
            "chat"
          ],
          "description": "Default compose (the tested route)."
        },
        "timeout_sec": {
          "type": "number"
        }
      },
      "required": [
        "genre"
      ]
    }
  },
  {
    "name": "flow_music_download",
    "description": "Download a Flow Music song as WAV/MP3/M4A to outputs/music (free, no credits). WAV is 48 kHz stereo and is the one to cut from. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "song_id": {
          "type": "string"
        },
        "title": {
          "type": "string",
          "description": "Used when song_id is unknown."
        },
        "take": {
          "type": "number"
        },
        "format": {
          "type": "string",
          "enum": [
            "WAV",
            "MP3",
            "M4A"
          ]
        },
        "out_dir": {
          "type": "string"
        },
        "name": {
          "type": "string"
        }
      },
      "required": []
    }
  },
  {
    "name": "flow_music_shorten",
    "description": "Cut a downloaded track to a beat-aligned length, locally and free: measures the tempo and first kick, then cuts whole bars with ffmpeg (4 ms fade-in, 40 ms fade-out). This is how a 16 s or 30 s bed is actually made - never trust the requested BPM.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "input": {
          "type": "string"
        },
        "output": {
          "type": "string"
        },
        "target_sec": {
          "type": "number",
          "description": "Desired length, e.g. 15.24 for 8 bars at 126 BPM."
        },
        "bars": {
          "type": "number"
        },
        "beats": {
          "type": "number"
        },
        "bpm": {
          "type": "number",
          "description": "Override the measured tempo."
        },
        "start_bar": {
          "type": "number"
        }
      },
      "required": [
        "input"
      ]
    }
  },
  {
    "name": "flow_music_songs",
    "description": "List the songs in the Flow Music library (id, title, length, date) so a song can be downloaded or trimmed by id. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "flow_music_trim",
    "description": "Trim a song inside Flow Music (song menu > Remix > Trim, 0.1 s steps, 0 credits) and keep the new song in the library. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "song_id": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "take": {
          "type": "number"
        },
        "start": {
          "type": "number",
          "description": "Seconds, e.g. 0.4."
        },
        "end": {
          "type": "number"
        }
      },
      "required": [
        "start",
        "end"
      ]
    }
  },
  {
    "name": "flow_music_stems",
    "description": "Split a Flow Music song into 4 stems (drums, bass, other, vocals), unzipped and downloaded (free). Use the vocals stem to prove an \"instrumental\" track has no vocals. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "song_id": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "take": {
          "type": "number"
        },
        "out_dir": {
          "type": "string"
        }
      },
      "required": []
    }
  },
  {
    "name": "flow_save_frame",
    "description": "Save one frame of a clip as a jpg (first, middle, last, or a timestamp) so it can seed the next generation: upload it to Flow and use it as an ingredient to continue the same shot, or as the first frame of a different scene. Flow's own editor has the same button (\"Save frame\"); this is instant and free and can also upload the frame into the current project. The frame itself is extracted locally and free; uploading it to Flow is a queued cloud task (note: the file lives on the MCP server, so the cloud browser cannot pick it in a file chooser).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "video_file": {
          "type": "string",
          "description": "Local video path."
        },
        "at": {
          "type": "string",
          "description": "first (default), middle, last, or a number of seconds."
        },
        "output_name": {
          "type": "string",
          "description": "Output file name without extension."
        },
        "upload_to_flow": {
          "type": "boolean",
          "description": "Upload the frame into the current project so the agent can use it."
        },
        "attach_to_prompt": {
          "type": "boolean",
          "description": "Also attach it to the agent prompt box as an ingredient."
        },
        "project_name": {
          "type": "string",
          "description": "Project name when a new project has to be created."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign/session label for project reuse."
        }
      },
      "required": [
        "video_file"
      ]
    }
  },
  {
    "name": "flow_download_latest",
    "description": "Download the media open in Flow's viewer, or the newest finished image or video of the current project, through Flow's own Download menu (images save as jpg, clips as mp4). Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete. Downloaded files land in the cloud browser's download folder; the MCP receives the media id and URL, not a local path.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "quality": {
          "type": "string",
          "description": "original (default, free), 1k, 2k or 4k. Upscales may cost credits (1080p/4K); video originals come as 720p mp4.",
          "default": "original"
        },
        "output_folder": {
          "type": "string",
          "description": "Folder for the file (default: outputs/images)."
        }
      }
    }
  },
  {
    "name": "flow_create_character",
    "description": "Create a character in the Flow project. With auto_confirm=false (default) it only fills the \"New character\" form. With auto_confirm=true it generates the character from the description (or, if reference_images is given, turns the first photo directly into the character), names it and presses Done. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Character name."
        },
        "description": {
          "type": "string",
          "description": "Character description / image prompt (also saved as character info when a photo is used)."
        },
        "personality": {
          "type": "string",
          "description": "Optional character info: how the character acts."
        },
        "model": {
          "type": "string",
          "description": "Optional image model for generating the character."
        },
        "reference_images": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Photo paths; with auto_confirm the first one becomes the character directly (no generation)."
        },
        "auto_confirm": {
          "type": "boolean",
          "description": "false (default): fill the form only. true: create the character.",
          "default": false
        },
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign (e.g. \"summer-2026\")."
        }
      },
      "required": [
        "name",
        "description"
      ]
    }
  },
  {
    "name": "flow_import_character",
    "description": "Create a character from a saved JSON file: {\"name\",\"description\",\"personality?\",\"model?\",\"reference_images?\":[paths relative to the file]}. Staged unless auto_confirm=true. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "file_path": {
          "type": "string",
          "description": "Path to the character JSON file."
        },
        "auto_confirm": {
          "type": "boolean",
          "description": "false (default): fill the form only. true: create the character.",
          "default": false
        },
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign (e.g. \"summer-2026\")."
        }
      },
      "required": [
        "file_path"
      ]
    }
  },
  {
    "name": "flow_open_characters",
    "description": "Open the project's Characters view and list the characters in it. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign (e.g. \"summer-2026\")."
        }
      }
    }
  },
  {
    "name": "flow_create_scene",
    "description": "Create (and optionally name) an empty scene in the Flow project. Flow scenes are timelines of video clips, so the prompt and characters cannot be placed inside the new scene; they are only recorded in local metadata. Undo by moving the scene to Trash in Flow. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Scene title."
        },
        "prompt": {
          "type": "string",
          "description": "Scene notes (saved locally only)."
        },
        "characters": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Character names (saved locally only)."
        },
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign (e.g. \"summer-2026\")."
        }
      },
      "required": []
    }
  },
  {
    "name": "flow_add_to_scene",
    "description": "Add a finished clip or image to a Flow scene (the project grid tile > More options > \"Add to scene\"), which is how Flow stitches clips into a longer sequence. Free: adding clips costs nothing, only generating inside the scene does. Flow scenes hold one timeline per project. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "media_name": {
          "type": "string",
          "description": "Name (or part of it) of the clip to add, as shown on the tile."
        },
        "media_index": {
          "type": "number",
          "description": "Fallback: position of a non-scene tile, newest first (default 0)."
        },
        "scene_name": {
          "type": "string",
          "description": "Scene to add it to; if omitted Flow's own chooser is used."
        },
        "project_name": {
          "type": "string",
          "description": "Project name when a new project has to be created."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign/session label for project reuse."
        }
      }
    }
  },
  {
    "name": "flow_open_tools_gallery",
    "description": "Open the project's Tools page and list My Tools, the Template tools and the Community tools. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign (e.g. \"summer-2026\")."
        }
      }
    }
  },
  {
    "name": "flow_use_grid_architect",
    "description": "Open Grid Architect (reusing the project's copy) and configure it: engine, ratio, visual logic, theme prompt and up to 4 shot prompts. It never presses GENERATE (credits) - do that in Flow. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "theme_prompt": {
          "type": "string",
          "description": "Overall theme prompt for the grid."
        },
        "shot_prompts": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Up to 4 shot prompts (switches the tool to SEQUENCE mode)."
        },
        "engine": {
          "type": "string",
          "description": "Nano Banana 2 or Nano Banana Pro.",
          "default": "Nano Banana 2"
        },
        "ratio": {
          "type": "string",
          "description": "Aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4.",
          "default": "16:9"
        },
        "visual_logic": {
          "type": "string",
          "description": "Style from References, Ultra Realistic, Cinematic Movie, Film Noir, or Anime / Manga."
        },
        "references": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Paths to reference images (uploaded only if the tool exposes a file input)."
        },
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign (e.g. \"summer-2026\")."
        }
      },
      "required": [
        "theme_prompt"
      ]
    }
  },
  {
    "name": "flow_use_tool",
    "description": "Open any Flow tool by name (e.g. Grid Architect, Image Editor, Shot Explorer). Reuses a copy already in \"My Tools\"; otherwise Flow copies the template into the project. Optionally fills text inputs/selects by label; it never runs the tool. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "tool_name": {
          "type": "string",
          "description": "Name of the tool to open."
        },
        "params": {
          "type": "object",
          "description": "Optional { label: value } pairs matched against the tool's inputs (placeholder / aria-label / name)."
        },
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign (e.g. \"summer-2026\")."
        }
      },
      "required": [
        "tool_name"
      ]
    }
  },
  {
    "name": "flow_create_tool",
    "description": "Build a NEW Flow Tool (a vibe-coded applet) from a description: opens the project's Create-tool page, submits the prompt, waits for the Tool Builder to finish (~1-2 min), optionally renames it, then reads the generated code and flags network/dynamic-code risks. Building costs no credits (there is an unpublished daily quota) and the tool is never run here: running a generative tool can spend credits, so test it yourself with fixture media and read its footer first. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "prompt": {
          "type": "string",
          "description": "The tool spec (20-8000 chars; ~250 words works best): name + purpose, inputs, behaviour, outputs, build order. Say \"no credits, no generation\" if it should not call models. Tell it to use Flow.media.select() for the gallery picker and Flow.download({base64, mimeType, filename}) for exports."
        },
        "tool_name": {
          "type": "string",
          "description": "Optional: rename the tool after the build."
        },
        "inspect_code": {
          "type": "boolean",
          "description": "Read the generated source and scan it (default true).",
          "default": true
        },
        "timeout_seconds": {
          "type": "number",
          "description": "Max seconds to wait for the build (default 300).",
          "default": 300
        },
        "project_name": {
          "type": "string",
          "description": "Name for a NEW project (only used when no project is open and no campaign match exists)."
        },
        "campaign": {
          "type": "string",
          "description": "Campaign identifier: reuses the project previously created for the same campaign."
        }
      },
      "required": [
        "prompt"
      ]
    }
  },
  {
    "name": "flow_refine_tool",
    "description": "Ask a tool's applet agent for ONE change (sidebar \"Ask applet agent to make changes\"). Identify the tool by tool_id or by name from My Tools. Waits for the agent to finish. The agent often edits things you did not ask for: re-test afterwards and snapshot versions with Remix. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "message": {
          "type": "string",
          "description": "One change request, literal and specific."
        },
        "tool_id": {
          "type": "string",
          "description": "Tool UUID."
        },
        "tool_name": {
          "type": "string",
          "description": "Name of a tool already in this project's My Tools."
        },
        "timeout_seconds": {
          "type": "number",
          "default": 300
        },
        "project_name": {
          "type": "string"
        },
        "campaign": {
          "type": "string"
        }
      },
      "required": [
        "message"
      ]
    }
  },
  {
    "name": "flow_inspect_tool",
    "description": "Read the source of a tool in this project (Code tab) and statically scan it: fetch/XHR/WebSocket/beacons/eval/remote scripts/external URLs and the Flow SDK calls it makes. Use before letting any shared or community tool (remix it into My Tools first) touch real uploads. Read-only. Runs in the signed-in cloud browser via the task queue: the MCP plans the steps, the agent executes them in the cloud browser and reports back with flow_cloud_complete.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "tool_id": {
          "type": "string",
          "description": "Tool UUID."
        },
        "tool_name": {
          "type": "string",
          "description": "Name of a tool in this project's My Tools."
        },
        "project_name": {
          "type": "string"
        },
        "campaign": {
          "type": "string"
        }
      }
    }
  },
  {
    "name": "flow_screenshot",
    "description": "Take a screenshot of the current Google Flow page in the signed-in cloud browser (agent-executed task queue).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Custom name for the screenshot file.",
          "default": "manual"
        }
      }
    }
  },
  {
    "name": "flow_queue_status",
    "description": "Check the job queue: active job, pending queue, completed and failed job history.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "history_limit": {
          "type": "number",
          "description": "Number of recent history entries to return.",
          "default": 5
        }
      }
    }
  },
  {
    "name": "flow_cloud_complete",
    "description": "Record the agent's execution result for a queued cloud task (called by the agent after running the assignment in the signed-in cloud browser). If the task was flow_connect, flow_account_check or flow_switch_account and the result shows an account verified as one of the configured rotation accounts, updates state/cloud-connection.json and makes that account the active one in state/accounts.json. If the task was a balance read, updates state/accounts.json. If a generation task failed because Flow reported insufficient credits, marks the active account exhausted so the next call can fall back to the next account.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "string",
          "description": "Cloud task id, e.g. cloud-1794485000000-a1b2."
        },
        "result": {
          "type": "object",
          "description": "Execution result object reported by the agent (media ids/URLs, credits before/after, account, errors)."
        },
        "status": {
          "type": "string",
          "enum": [
            "done",
            "failed"
          ],
          "description": "done when the assignment finished, failed when it could not be completed."
        },
        "error": {
          "type": "string",
          "description": "Error message when status is failed."
        }
      },
      "required": [
        "task_id",
        "result"
      ]
    }
  },
  {
    "name": "flow_cloud_result",
    "description": "Return a queued cloud task with its stored result (if any).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "string",
          "description": "Cloud task id."
        }
      },
      "required": [
        "task_id"
      ]
    }
  }
];
