import { Project } from '../types';

export const projects: Project[] = [
  {
    id: "axisflow",
    name: "AxisFlow",
    slug: "axisflow",
    tagline: "High-Throughput Autonomous AI Agent & Workflow Orchestrator",
    description: "AxisFlow is a low-latency workflow orchestrator designed to deploy, monitor, and scale complex multi-agent AI loops. It utilizes a stateful node grid to visualize model routing, memory injection, and dynamic tool calls, providing an engineering dashboard to oversee automation loops in real time.",
    status: "beta",
    roadmapStage: "Testing",
    version: "v0.9.2-rc1",
    platform: "Web & CLI",
    platformIcon: "laptop",
    progress: 88,
    lastUpdated: "2026-07-10",
    colorTheme: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    accentColor: "#58A6FF",
    githubUrl: "https://github.com/Chinmay20-09/axisflow",
    bugReportUrl: "https://github.com/Chinmay20-09/axisflow/issues/new?labels=bug",
    featureRequestUrl: "https://github.com/Chinmay20-09/axisflow/issues/new?labels=enhancement",
    documentationUrl: "https://github.com/Chinmay20-09/axisflow/wiki",
    projectPageUrl: "https://axisflow.kolte.dev",
    currentlyShipping: true,
    expectedNextRelease: "August 2026",
    problem: "Orchestrating multi-agent AI pipelines is plagued by latency, loss of state, and invisible token overhead. Developers lack interactive visibility into tool invocation loops and real-time cost-performance optimization.",
    solution: "AxisFlow introduces an event-driven orchestrator with a stateful node-mesh layout that tracks agent memory injection, provides self-healing backtrack hooks, and monitors performance in real-time.",
    downloadAssets: {
      windows: "https://github.com/Chinmay20-09/axisflow/releases/download/v0.9.2/axisflow-setup.exe",
      mac: "",
      linux: "https://github.com/Chinmay20-09/axisflow/releases/download/v0.9.2/axisflow-linux.tar.gz",
      android: "",
      cli: "npm install -g @axisflow/cli"
    },
    expectedFeatures: [
      "Dynamic Multi-Agent Mesh Router",
      "Local vector storage integration (HNSW)",
      "Real-time token and state telemetry dashboards",
      "Self-healing workflows with automatic backtrack"
    ],
    techStack: [
      { category: "Core Engine", name: "TypeScript / Node.js", badge: "Runtime" },
      { category: "Database & Index", name: "PostgreSQL & SQLite", badge: "Relational" },
      { category: "AI Layer", name: "@google/genai SDK", badge: "LLM Orchestration" },
      { category: "Realtime", name: "WebSockets / SSE", badge: "Streaming" }
    ],
    knownIssues: [
      "Slight memory overhead during 100+ concurrent state-machine ticks",
      "Draft UI layout artifacts on Safari mobile engine"
    ],
    changelog: [
      {
        version: "v0.9.2-rc1",
        date: "2026-07-10",
        added: [
          "Integrated @google/genai SDK for native, server-side Gemini function calling.",
          "Added real-time cost and latency estimation counters to node views."
        ],
        improved: [
          "Optimized system memory usage in long loop processes."
        ],
        fixed: [
          "Fixed SQLite thread locks on massive multi-agent writing loops."
        ]
      },
      {
        version: "v0.9.0-alpha",
        date: "2026-05-18",
        added: [
          "Core system initial release.",
          "Visual state designer framework integration."
        ],
        improved: [
          "Engine support for parallel DAG executions."
        ],
        fixed: []
      }
    ],
    faq: [
      { q: "Is AxisFlow open-source?", a: "Yes, AxisFlow is completely open-source and licensed under the Apache-2.0 license." },
      { q: "Can I run AxisFlow offline?", a: "Absolutely! You can run the orchestrator and coordinate local workflows utilizing offline Ollama or llama.cpp runtimes." },
      { q: "How does the self-healing layout work?", a: "When a node task crashes or receives empty models output, the orchestrator triggers customized backtrack hook rules to fallback to previous node states." }
    ],
    gallery: [
      { title: "Mesh Router Board Diagram", url: "" },
      { title: "Telemetry Cost Dashboard View", url: "" }
    ]
  },
  {
    id: "sarthi",
    name: "Sarthi",
    slug: "sarthi",
    tagline: "Localized Multi-lingual AI Assistant Co-pilot",
    description: "Sarthi is an offline-capable conversational co-pilot engineered specifically for regional Indian languages. Running lightweight quantized models locally on-device, Sarthi helps users parse document templates, voice-transcribe dialogues, and automate localized actions without needing high-bandwidth cloud routing.",
    status: "alpha",
    roadmapStage: "Development",
    version: "v0.4.5-dev",
    platform: "Android & Web",
    platformIcon: "smartphone",
    progress: 65,
    lastUpdated: "2026-07-01",
    colorTheme: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
    accentColor: "#FF7B72",
    githubUrl: "https://github.com/Chinmay20-09/sarthi",
    bugReportUrl: "https://github.com/Chinmay20-09/sarthi/issues/new?labels=bug",
    featureRequestUrl: "https://github.com/Chinmay20-09/sarthi/issues/new?labels=enhancement",
    documentationUrl: "",
    projectPageUrl: "",
    currentlyShipping: false,
    expectedNextRelease: "October 2026",
    problem: "Many rural areas lack high-bandwidth internet connections, yet require intelligent assistant solutions to parse regional templates, OCR scans, and voice commands.",
    solution: "Sarthi bundles lightweight on-device inference engines (such as Whisper.cpp and ONNX Runtime Mobile) directly inside a cross-platform Flutter app, delivering seamless multilingual assistance 100% offline.",
    downloadAssets: {
      windows: "",
      mac: "",
      linux: "",
      android: "https://github.com/Chinmay20-09/sarthi/releases/download/v0.4.5/sarthi-beta.apk",
      cli: ""
    },
    expectedFeatures: [
      "Quantized On-Device LLM Pipeline (Llama 3 8B Int4)",
      "High-accuracy voice-to-text engines in 8 regional languages",
      "Offline translation and OCR file scanning templates",
      "Intelligent text-to-speech with local audio synthesis"
    ],
    techStack: [
      { category: "Frontend", name: "Flutter / Dart", badge: "Cross-platform UI" },
      { category: "Inference Engine", name: "ONNX Runtime Mobile", badge: "On-Device AI" },
      { category: "Local Speech", name: "Whisper.cpp", badge: "Voice Parsing" },
      { category: "Database", name: "Isar Database", badge: "Secure Cache" }
    ],
    knownIssues: [
      "Inference thermal throttle on mid-range Android chips under long loops",
      "Audio playback latency on Android devices older than API level 28"
    ],
    changelog: [
      {
        version: "v0.4.5-dev",
        date: "2026-07-01",
        added: [
          "Implemented native Whisper speech voice models with custom vocab lists.",
          "Created modular audio recording buffer manager."
        ],
        improved: [
          "Optimized ONNX weight loading times by 40% using memory maps."
        ],
        fixed: []
      }
    ],
    faq: [
      { q: "Which regional Indian languages are supported?", a: "Sarthi supports Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu, Kannada, and Malayalam." },
      { q: "Does Sarthi send my voice to any external server?", a: "No! All audio recording and Whisper transcriptions are completed locally on-device without any network connections." }
    ],
    gallery: [
      { title: "ASR Speech Waveform Monitor", url: "" },
      { title: "Offline Multi-lingual Dialogue Sandbox", url: "" }
    ]
  },
  {
    id: "master-controller",
    name: "Master Controller",
    slug: "master-controller",
    tagline: "Infrastructure Health & Network Dashboard Node",
    description: "An automated infrastructure and telemetry health dashboard. Master Controller monitors microservices, server metrics, network packet drops, and cloud instances, dispatching emergency alerts via Discord and email before incidents escalate.",
    status: "stable",
    roadmapStage: "Released",
    version: "v2.1.0",
    platform: "Linux, macOS & Web",
    platformIcon: "laptop",
    progress: 100,
    lastUpdated: "2026-06-25",
    colorTheme: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    accentColor: "#BC8CFF",
    githubUrl: "https://github.com/Chinmay20-09/master-controller",
    bugReportUrl: "https://github.com/Chinmay20-09/master-controller/issues",
    featureRequestUrl: "https://github.com/Chinmay20-09/master-controller/issues",
    documentationUrl: "https://github.com/Chinmay20-09/master-controller/docs",
    projectPageUrl: "https://mc.kolte.dev",
    currentlyShipping: false,
    expectedNextRelease: "Fully Released",
    problem: "Monitoring microservices and server clusters usually requires heavy agents like Prometheus/Grafana which consume massive system resources on tiny VPS nodes.",
    solution: "Master Controller is a lightweight compiled Go binary that queries system sockets, sniffing packet metrics in microseconds, and serves a modern, tiny Svelte-based frontend dashboard.",
    downloadAssets: {
      windows: "https://github.com/Chinmay20-09/master-controller/releases/download/v2.1.0/mc-setup.msi",
      mac: "https://github.com/Chinmay20-09/master-controller/releases/download/v2.1.0/mc-darwin-dmg",
      linux: "https://github.com/Chinmay20-09/master-controller/releases/download/v2.1.0/mc-linux-amd64",
      android: "",
      cli: "curl -sS https://mc.kolte.dev/install.sh | sh"
    },
    expectedFeatures: [
      "Custom prometheus and grafana integration bridges",
      "Instant TCP/HTTP packet drop sniffing alert models",
      "Secure webhook pipelines with automated deployment fallback scripts",
      "Memory, disk, and CPU alert triggers with auto-cleanup loops"
    ],
    techStack: [
      { category: "Backend Node", name: "Go (Golang)", badge: "Core Engine" },
      { category: "Web Dashboard", name: "Svelte & Tailwind", badge: "Dashboard UI" },
      { category: "Database", name: "TimescaleDB / Redis", badge: "Time-series Storage" },
      { category: "Alert Systems", name: "Discord & Slack Webhooks", badge: "Notifications" }
    ],
    knownIssues: [
      "Higher CPU usage on single-core setups with 10,000+ monitored metrics",
      "TimescaleDB vacuum operations temporarily delay API read routes"
    ],
    changelog: [
      {
        version: "v2.1.0",
        date: "2026-06-25",
        added: [
          "Added raw packet drop sniffing widgets on visual network maps."
        ],
        improved: [
          "Upgraded Go metrics sniffer engine using fast concurrent thread channels."
        ],
        fixed: [
          "Resolved Redis memory leak during continuous high-rate TCP health queries."
        ]
      },
      {
        version: "v2.0.0",
        date: "2026-04-12",
        added: [
          "Complete rewritten core engine in Go for sub-millisecond telemetry loops.",
          "Added Svelte visual web console with beautiful grid filters."
        ],
        improved: [],
        fixed: []
      }
    ],
    faq: [
      { q: "How many servers can a single Master Controller monitor?", a: "A single instance can easily track up to 500 remote target nodes running our lightweight metrics client script." },
      { q: "Does Master Controller support third-party alerting integrations?", a: "Yes, out-of-the-box alerting rules support Discord webhooks, Slack channels, Telegram bots, and standard SMTP emails." }
    ],
    gallery: [
      { title: "Dynamic Services Grid View", url: "" },
      { title: "Real-time Metrics Tracking Diagram", url: "" }
    ]
  },
  {
    id: "lakshman-rekha",
    name: "Lakshman Rekha",
    slug: "lakshman-rekha",
    tagline: "Local Privacy Shield & DNS Network Blocker",
    description: "Lakshman Rekha is a security-first network packet scanner and DNS blocker. Running locally, it blocks tracker domains, malicious adware, and telemetry leaks while compiling local graphs on which external server nodes your machines are silently communicating with.",
    status: "paused",
    roadmapStage: "Planning",
    version: "v0.1.2-beta",
    platform: "Linux / CLI",
    platformIcon: "terminal",
    progress: 30,
    lastUpdated: "2026-05-10",
    colorTheme: "linear-gradient(135deg, #4A0E4E 0%, #0D0D0D 100%)",
    accentColor: "#F0883E",
    githubUrl: "https://github.com/Chinmay20-09/lakshman-rekha",
    bugReportUrl: "https://github.com/Chinmay20-09/lakshman-rekha/issues",
    featureRequestUrl: "https://github.com/Chinmay20-09/lakshman-rekha/issues",
    documentationUrl: "",
    projectPageUrl: "",
    currentlyShipping: false,
    expectedNextRelease: "Q4 2026",
    problem: "Most tracking and adware domains leak data silently in the background, consuming networking bandwidth and violating system privacy parameters without users knowing.",
    solution: "Lakshman Rekha establishes a low-level local DNS proxy that filters DNS lookups through a compiled blocker ledger, using eBPF kernel adapters to map out active tracking nodes.",
    downloadAssets: {
      windows: "",
      mac: "",
      linux: "https://github.com/Chinmay20-09/lakshman-rekha/releases/download/v0.1.2/lr-cli-linux-amd64",
      android: "",
      cli: ""
    },
    expectedFeatures: [
      "Highly performant local DNS forwarding core",
      "Tracker rules compilation with auto-update loops",
      "Network adapter traffic graphing and domain sniffing",
      "Local hosts sandbox rule control panel"
    ],
    techStack: [
      { category: "System Core", name: "Rust", badge: "Low-level Systems" },
      { category: "Network Packet", name: "libpcap / eBPF", badge: "Kernel Hook" },
      { category: "Configuration", name: "SQLite", badge: "Local Storage" },
      { category: "Console Client", name: "Cursive TUI", badge: "Terminal UI" }
    ],
    knownIssues: [
      "eBPF routing requires superuser privileges under standard Linux setups",
      "Temporary packet drops when rewriting local system loop routes"
    ],
    changelog: [
      {
        version: "v0.1.2-beta",
        date: "2026-05-10",
        added: [
          "Draft low-level DNS parser using Rust trust-dns library."
        ],
        improved: [
          "Implemented basic hosts list crawler and cache compiler."
        ],
        fixed: []
      }
    ],
    faq: [
      { q: "Is superuser (root) privilege required?", a: "Yes, eBPF kernel hooks and low-level socket listening (port 53) require superuser authorization on standard Linux distributions." },
      { q: "How are blocking filters maintained?", a: "Blocks are compiled and aggregated hourly from multiple highly secure, trusted tracking filter ledgers." }
    ],
    gallery: [
      { title: "TUI Interface Main Grid", url: "" }
    ]
  }
];
