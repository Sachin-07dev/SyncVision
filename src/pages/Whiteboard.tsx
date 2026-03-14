import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "@/styles/whiteboard.css";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Save,
  Share2,
  Moon,
  Sun,
  Palette,
  Maximize,
  Minimize,
  FolderOpen,
  FilePlus,
  Clock,
  Zap,
  Users,
} from "lucide-react";

/* ── Types ─────────────────────────────────── */
type BoardTheme = "default" | "frost" | "midnight" | "aurora";

interface BoardMeta {
  id?: string;
  name: string;
  elements: any[];
  appState: any;
  lastSaved?: string;
}

/* ── Theme presets for the wrapper chrome ───── */
const BOARD_THEMES: Record<
  BoardTheme,
  { label: string; light: string; dark: string; accent: string; canvasBg: { light: string; dark: string } }
> = {
  default: {
    label: "Default",
    light: "wb-bg-default-light",
    dark: "wb-bg-default-dark",
    accent: "from-violet-500 to-indigo-600",
    canvasBg: { light: "#ffffff", dark: "#0d1117" },
  },
  frost: {
    label: "Frost",
    light: "wb-bg-frost-light",
    dark: "wb-bg-frost-dark",
    accent: "from-sky-400 to-blue-600",
    canvasBg: { light: "#f0f7ff", dark: "#0a1628" },
  },
  midnight: {
    label: "Midnight",
    light: "wb-bg-midnight-light",
    dark: "wb-bg-midnight-dark",
    accent: "from-purple-500 to-fuchsia-600",
    canvasBg: { light: "#faf8ff", dark: "#0b0d1a" },
  },
  aurora: {
    label: "Aurora",
    light: "wb-bg-aurora-light",
    dark: "wb-bg-aurora-dark",
    accent: "from-emerald-400 to-teal-600",
    canvasBg: { light: "#f0fdf8", dark: "#071a15" },
  },
};

const Whiteboard = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [board, setBoard] = useState<BoardMeta>({
    name: "Untitled Board",
    elements: [],
    appState: {},
  });
  const [boardTheme, setBoardTheme] = useState<BoardTheme>("default");
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [boardName, setBoardName] = useState("Untitled Board");
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === "dark";
  const themeConfig = BOARD_THEMES[boardTheme];

  /* ── Load existing board ───────────────────── */
  useEffect(() => {
    if (!boardId) return;
    api.boards
      .get(boardId)
      .then((b: any) => {
        setBoard({
          id: b.id,
          name: b.name,
          elements: b.data?.elements || [],
          appState: b.data?.state || {},
        });
        setBoardName(b.name || "Untitled Board");
        if (excalidrawAPI && b.data?.elements) {
          excalidrawAPI.updateScene({ elements: b.data.elements });
        }
      })
      .catch(() => {
        /* new board or no access */
      });
  }, [boardId, excalidrawAPI]);

  /* ── Auto-save (debounced 3s after last change) */
  const scheduleAutoSave = useCallback(() => {
    if (!isAuthenticated || !excalidrawAPI) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(true);
    }, 3000);
  }, [isAuthenticated, excalidrawAPI, board.id, boardName]);

  /* ── Manual save ───────────────────────────── */
  const handleSave = async (silent = false) => {
    if (!isAuthenticated) {
      toast.error("Sign in to save boards");
      navigate("/auth");
      return;
    }
    if (!excalidrawAPI) return;
    setIsSaving(true);
    const elements = excalidrawAPI.getSceneElements();
    const state = excalidrawAPI.getAppState();

    try {
      if (board.id) {
        await api.boards.update(board.id, {
          name: boardName,
          data: { elements, state },
        });
      } else {
        const created: any = await api.boards.create(boardName, "whiteboard", {
          elements,
          state,
        });
        setBoard((prev) => ({ ...prev, id: created.id }));
        window.history.replaceState(null, "", `/whiteboard/${created.id}`);
      }
      setBoard((prev) => ({
        ...prev,
        elements,
        appState: state,
        lastSaved: new Date().toISOString(),
      }));
      if (!silent) toast.success("Board saved!");
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Fullscreen toggle ─────────────────────── */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ── Board name editing ────────────────────── */
  const startEditName = () => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 50);
  };

  const finishEditName = () => {
    setIsEditingName(false);
    if (!boardName.trim()) setBoardName("Untitled Board");
  };

  /* ── Keyboard shortcuts ────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [excalidrawAPI, board.id, boardName, isAuthenticated]);

  /* ── Render ────────────────────────────────── */
  return (
    <div
      ref={wrapperRef}
      className={`h-screen w-screen flex flex-col overflow-hidden excalidraw-board-wrapper wb-theme-${boardTheme} ${
        isDark ? themeConfig.dark : themeConfig.light
      }`}
    >
      {/* ── Top toolbar ─────────────────────────── */}
      <header className="wb-toolbar h-12 flex-shrink-0 flex items-center justify-between px-3 z-50">
        {/* Left section */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-1.5 group flex-shrink-0"
          >
            <div
              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${themeConfig.accent} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}
            >
              <span className="text-xs font-bold text-white">E</span>
            </div>
          </Link>

          <div className="wb-divider" />

          {/* Board name */}
          {isEditingName ? (
            <input
              ref={nameInputRef}
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onBlur={finishEditName}
              onKeyDown={(e) => e.key === "Enter" && finishEditName()}
              className="text-sm font-semibold bg-transparent border-b-2 border-primary/50 outline-none px-1 py-0.5 w-48 text-foreground"
              maxLength={60}
            />
          ) : (
            <button
              onClick={startEditName}
              className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors truncate max-w-[200px]"
              title="Click to rename"
            >
              {boardName}
            </button>
          )}

          {board.lastSaved && (
            <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1 ml-1 flex-shrink-0">
              <Clock className="w-3 h-3" />
              Saved
            </span>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Theme picker */}
          <div className="relative">
            <WbToolbarBtn
              icon={<Palette className="w-4 h-4" />}
              tooltip="Board theme"
              onClick={() => setShowThemePicker(!showThemePicker)}
              active={showThemePicker}
            />
            {showThemePicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemePicker(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 p-1.5 rounded-xl wb-dropdown z-50 w-[160px]">
                  <p className="text-[10px] text-muted-foreground font-medium px-2 py-1 uppercase tracking-wider">
                    Canvas Theme
                  </p>
                  {(Object.keys(BOARD_THEMES) as BoardTheme[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setBoardTheme(key);
                        setShowThemePicker(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2
                        ${
                          boardTheme === key
                            ? "bg-primary/15 text-primary"
                            : "hover:bg-muted/60 text-foreground/70"
                        }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-gradient-to-br ${BOARD_THEMES[key].accent} ring-1 ring-white/20`}
                      />
                      {BOARD_THEMES[key].label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <WbToolbarBtn
            icon={isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            tooltip={isDark ? "Light mode" : "Dark mode"}
            onClick={toggleTheme}
          />

          <WbToolbarBtn
            icon={
              isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )
            }
            tooltip={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={toggleFullscreen}
          />

          <div className="wb-divider" />

          <WbToolbarBtn
            icon={<Save className="w-4 h-4" />}
            tooltip="Save (Ctrl+S)"
            onClick={() => handleSave()}
            loading={isSaving}
          />

          <button
            onClick={() =>
              toast.info(
                "Share link: " +
                  window.location.origin +
                  "/whiteboard/" +
                  (board.id || "new")
              )
            }
            className={`wb-share-btn bg-gradient-to-r ${themeConfig.accent}`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </header>

      {/* ── Canvas area ─────────────────────────── */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <div className="absolute inset-0 wb-canvas-container">
        <Excalidraw
          excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
          theme={isDark ? "dark" : "light"}
          initialData={{
            elements: board.elements,
            appState: {
              ...board.appState,
              viewBackgroundColor: isDark
                ? themeConfig.canvasBg.dark
                : themeConfig.canvasBg.light,
            },
          }}
          onChange={() => scheduleAutoSave()}
          UIOptions={{
            canvasActions: {
              saveToActiveFile: false,
              loadScene: false,
              export: { saveFileToDisk: true },
              changeViewBackgroundColor: true,
            },
          }}
        >
          <MainMenu>
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
            <MainMenu.Separator />
            <MainMenu.Item
              onSelect={() => navigate("/boards")}
              icon={<FolderOpen className="w-4 h-4" />}
            >
              My Boards
            </MainMenu.Item>
            <MainMenu.Item
              onSelect={() => {
                window.history.pushState(null, "", "/whiteboard");
                setBoard({ name: "Untitled Board", elements: [], appState: {} });
                setBoardName("Untitled Board");
                excalidrawAPI?.resetScene();
              }}
              icon={<FilePlus className="w-4 h-4" />}
            >
              New Board
            </MainMenu.Item>
          </MainMenu>

          <WelcomeScreen>
            <WelcomeScreen.Center>
              <WelcomeScreen.Center.Logo>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${themeConfig.accent} flex items-center justify-center shadow-xl`}
                  >
                    <span className="text-xl font-bold text-white">E</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">ExceliBoard</h2>
                    <p className="text-xs text-muted-foreground">
                      Collaborative Canvas
                    </p>
                  </div>
                </div>
              </WelcomeScreen.Center.Logo>
              <WelcomeScreen.Center.Heading>
                Start drawing, sketching, or diagramming
              </WelcomeScreen.Center.Heading>
              <WelcomeScreen.Center.Menu>
                <WelcomeScreen.Center.MenuItemLoadScene />
                <WelcomeScreen.Center.MenuItemHelp />
              </WelcomeScreen.Center.Menu>
            </WelcomeScreen.Center>
          </WelcomeScreen>
        </Excalidraw>
        </div>
      </div>

      {/* ── Bottom status bar ───────────────────── */}
      <footer className="wb-statusbar h-7 flex-shrink-0 flex items-center justify-between px-3 text-[10px] text-muted-foreground z-50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-primary" />
            ExceliBoard Canvas
          </span>
          {isAuthenticated && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {user?.displayName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{board.elements.length} elements</span>
          {board.lastSaved && (
            <span>
              Last saved:{" "}
              {new Date(board.lastSaved).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};

/* ── Toolbar button ──────────────────────────── */
function WbToolbarBtn({
  icon,
  tooltip,
  onClick,
  active,
  loading,
}: {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`wb-toolbar-btn ${active ? "active" : ""} ${loading ? "animate-pulse" : ""}`}
    >
      {icon}
    </button>
  );
}

export default Whiteboard;
