import {
  Button,
  Slider,
  Play,
  Pause,
  ForwardStep,
  ArrowRotateLeft,
  Text,
} from "./controls";
import { ReplayFrame } from "./ReplayFrame";
import { useDemoWalkthrough } from "./provider";
import type { Perspective } from "./contracts";
import "./style.css";
export * from "./provider";
export type * from "./contracts";
export function DemoWalkthroughStudio() {
  const {
    libraryOpen,
    reviewView,
    actor,
    busy,
    running,
    chooseActor,
    actors,
    journeys,
    workflow,
    chooseWorkflow,
    journeyTitle,
    setLibraryOpen,
    setReviewView,
    recordings,
    setRecording,
    setMode,
    setPlaying,
    setTime,
    recordingProgress,
    clock,
    enabled,
    setActor,
    stopRun,
    defaultActor,
    fresh,
    names,
    node,
    stage,
    surfaces,
    playback,
    time,
    handoff,
    actorName,
    stepActor,
    mode,
    nonce,
    frames,
    frameUrl,
    paths,
    moveCursor,
    subtitles,
    guideFor,
    selected,
    crossHandoff,
    cursor,
    recording,
    activeCaptureAt,
    playing,
    duration,
    setSubtitles,
    speed,
    setSpeed,
    captures,
    reviewPane,
    activeChapter,
    branch,
    setBranch,
    guideState,
    fixture,
    error,
    setZoom,
    width,
    zoom,
    height,
    graph,
    select,
    chapters,
    branches,
    record,
    frameName,
    prepareSnapshot,
    saveSubtitles,
  } = useDemoWalkthrough();
  return (
    <div className="demo-walkthrough-root">
      <div
        className="workflow-player"
        data-library={libraryOpen}
        data-review={reviewView}
      >
        <header className="wp-heading">
          <div>
            <h1>Workflow studio</h1>
            <label className="wp-workflow-picker">
              Perspective
              <select
                aria-label="Perspective"
                value={actor}
                disabled={busy || running}
                onChange={(e) => chooseActor(e.target.value as Perspective)}
              >
                {actors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
                {actor === "all" && (
                  <option value="all">Complete process</option>
                )}
              </select>
            </label>
            <label className="wp-workflow-picker">
              Journey{" "}
              <select
                aria-label="Select journey"
                value={journeys.length ? workflow.id : ""}
                disabled={busy || running || !journeys.length}
                onChange={(e) => chooseWorkflow(e.target.value)}
              >
                {!journeys.length && (
                  <option value="">No recorded journeys yet</option>
                )}
                {journeys.map((w) => (
                  <option key={w.id} value={w.id}>
                    {journeyTitle(w.id, actor, w.title)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="wp-row">
            <Button
              size="sm"
              variant="ghost"
              aria-expanded={libraryOpen}
              onPress={() => setLibraryOpen((v) => !v)}
            >
              Library & recordings
            </Button>
            <Button
              size="sm"
              variant={reviewView === "timeline" ? "secondary" : "ghost"}
              aria-pressed={reviewView === "timeline"}
              onPress={() => setReviewView("timeline")}
            >
              Timeline
            </Button>
            <Button
              size="sm"
              variant={reviewView === "map" ? "secondary" : "ghost"}
              aria-pressed={reviewView === "map"}
              onPress={() => setReviewView("map")}
            >
              Workflow map
            </Button>
          </div>
        </header>
        <div className="wp-layout">
          <aside className="wp-library">
            <h2>Journeys for this person</h2>
            {journeys.map((w) => (
              <Button
                key={w.id}
                variant={w.id === workflow.id ? "secondary" : "ghost"}
                isDisabled={busy || running}
                aria-label={w.title}
                onPress={() => chooseWorkflow(w.id)}
              >
                {journeyTitle(w.id, actor, w.title)}
              </Button>
            ))}
            <hr />
            <h3>Saved recordings</h3>
            {recordings
              .filter((r) => r.workflow === workflow.id && journeys.length > 0)
              .map((r) => (
                <button
                  className="wp-run"
                  key={r.id}
                  disabled={running}
                  onClick={() => {
                    setRecording(r);
                    setMode("replay");
                    setPlaying(false);
                    setTime(0);
                  }}
                >
                  {new Date(r.createdAt).toLocaleString()}
                  <small>
                    {recordingProgress(r, workflow).label} ·{r.captures.length}{" "}
                    captures · {clock(r.captures.at(-1)?.at || 0)}
                  </small>
                </button>
              ))}
            {!recordings.some((r) => r.workflow === workflow.id) && (
              <p>No recording yet. Capture steps in the live views below.</p>
            )}
          </aside>
          {!journeys.length ? (
            <section className="wp-actor-empty">
              <h2>{actorName(actor)} journeys</h2>
              <p>
                No recorded journeys are available for this perspective yet.
              </p>
            </section>
          ) : (
            <section className="wp-workspace">
              <div className="wp-row">
                <div>
                  <h2>{journeyTitle(workflow.id, actor, workflow.title)}</h2>
                  <p>{workflow.description}</p>
                </div>
                <Button
                  isDisabled={!enabled || busy || running}
                  onPress={() => {
                    setActor("all");
                    record();
                  }}
                >
                  Record complete process
                </Button>
                {running && (
                  <Button
                    variant="secondary"
                    onPress={() => {
                      stopRun.current = true;
                    }}
                  >
                    Stop run
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={running}
                  onPress={() =>
                    chooseActor(
                      actor === "all" ? defaultActor(workflow.id) : "all",
                    )
                  }
                >
                  {actor === "all"
                    ? "View personal journey"
                    : "View complete process"}
                </Button>
                <Button
                  variant="secondary"
                  onPress={fresh}
                  isDisabled={busy || running}
                >
                  New recording
                </Button>
              </div>
              <p className="wp-note" aria-live="polite">
                Now showing {names[node.surface]} · {node.label}
              </p>
              <div ref={stage} className="wp-stage">
                {surfaces.map((s) => {
                  const c = [...playback]
                    .reverse()
                    .find((c) => c.surface === s && c.playAt <= time);
                  return (
                    <section
                      className={
                        "wp-frame " +
                        (s === node.surface ? "wp-frame-active" : "")
                      }
                      key={s}
                      hidden={s !== node.surface || handoff}
                    >
                      <header>
                        <strong>
                          {actorName(stepActor)} · {names[s]}
                        </strong>
                        <small>
                          {mode === "live"
                            ? "Live · Guided focus"
                            : "Replay · Guided focus"}
                        </small>
                      </header>
                      <div className="wp-address">
                        {new URL(frameUrl(s, paths[s], nonce.current)).host}
                      </div>
                      {mode === "live" && enabled ? (
                        <iframe
                          key={"live-" + s}
                          name={frameName(nonce.current)}
                          title={names[s]}
                          ref={(el) => {
                            frames.current[s] = el;
                          }}
                          src={frameUrl(s, paths[s], nonce.current)}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                        />
                      ) : c ? (
                        <ReplayFrame
                          prepareSnapshot={prepareSnapshot}
                          capture={c}
                          title={names[s] + " recorded frame"}
                          active={s === node.surface && !handoff}
                          onFocus={moveCursor}
                        />
                      ) : (
                        <div className="wp-frame-empty">
                          {enabled
                            ? "No frame captured at this time."
                            : "Loading development player…"}
                        </div>
                      )}
                      {subtitles && (
                        <div
                          className="wp-subtitles"
                          role="status"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          <p>
                            {guideFor(workflow.id, selected)?.caption ||
                              "This scenario is not implemented yet. No action or result is being demonstrated."}
                          </p>
                        </div>
                      )}
                    </section>
                  );
                })}
                {handoff && (
                  <div className="wp-handoff" role="status">
                    <span>PERSON-TO-PERSON HANDOFF</span>
                    <h2>{actorName(stepActor)} takes the next step</h2>
                    <p>
                      Your journey pauses here while another person completes “
                      {node.label}”.
                    </p>
                    <Button onPress={crossHandoff}>
                      Switch to {actorName(stepActor).toLowerCase()} perspective
                    </Button>
                    <Button variant="ghost" onPress={() => chooseActor("all")}>
                      View complete process
                    </Button>
                  </div>
                )}
                <div
                  hidden={handoff}
                  className="wp-persistent-cursor"
                  aria-hidden="true"
                  style={{
                    transform: `translate3d(${cursor.x}px,${cursor.y}px,0)`,
                  }}
                >
                  {mode === "replay" &&
                    guideFor(workflow.id, selected)?.action === "click" && (
                      <span
                        key={`${recording?.id}:${activeCaptureAt}`}
                        className="wp-click-pulse"
                      />
                    )}
                  <svg
                    key={
                      mode === "replay"
                        ? `${recording?.id}:${activeCaptureAt}`
                        : "live"
                    }
                    className={
                      mode === "replay" &&
                      guideFor(workflow.id, selected)?.action === "click"
                        ? "wp-cursor-clicking"
                        : ""
                    }
                    width="22"
                    height="29"
                    viewBox="0 0 32 42"
                  >
                    <path
                      d="M2 2L2 34L10 27L17 39L24 35L17 23L29 22Z"
                      fill="#101510"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
              <div className="wp-controls">
                <Button
                  isIconOnly
                  aria-label={playing ? "Pause" : "Play"}
                  isDisabled={mode !== "replay" || !duration || handoff}
                  onPress={() => {
                    if (time >= duration) setTime(0);
                    setPlaying((v) => !v);
                  }}
                >
                  {playing ? (
                    <Pause aria-hidden="true" />
                  ) : (
                    <Play aria-hidden="true" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  isIconOnly
                  aria-label="Next capture"
                  isDisabled={
                    mode !== "replay" || !playback.some((c) => c.playAt > time)
                  }
                  onPress={() => {
                    setPlaying(false);
                    setTime(
                      playback.find((c) => c.playAt > time)?.playAt || duration,
                    );
                  }}
                >
                  <ForwardStep aria-hidden="true" />
                </Button>
                <strong className="wp-clock">
                  {clock(time)} / {clock(duration)}
                </strong>
                <Slider
                  aria-label="Playback time"
                  minValue={0}
                  maxValue={Math.max(duration, 1)}
                  step={1}
                  value={time}
                  isDisabled={mode !== "replay"}
                  onChange={(v) => {
                    setPlaying(false);
                    setTime(Number(v));
                  }}
                >
                  <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>
                <Button
                  variant="ghost"
                  isIconOnly
                  aria-label={subtitles ? "Hide subtitles" : "Show subtitles"}
                  aria-pressed={subtitles}
                  onPress={() => {
                    setSubtitles(!subtitles);
                    saveSubtitles(!subtitles);
                  }}
                >
                  <Text aria-hidden="true" />
                </Button>
                <label>
                  Speed{" "}
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                  >
                    {[0.5, 1, 1.5, 2].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <Button
                  variant="secondary"
                  isIconOnly
                  aria-label="Replay recording"
                  isDisabled={!captures.length || busy || running}
                  onPress={() => {
                    setMode("replay");
                    setTime(0);
                    setPlaying(true);
                  }}
                >
                  <ArrowRotateLeft aria-hidden="true" />
                </Button>
              </div>
              <div
                ref={reviewPane}
                className="wp-review"
                aria-label="Workflow review"
              >
                {mode === "replay" && chapters.length > 0 && (
                  <div aria-label="Parent steps" className="wp-capture-markers">
                    {chapters.map((chapter, i) => {
                      const first = playback.find((c) =>
                        chapter.steps.includes(c.stepId),
                      );
                      return (
                        <Button
                          key={chapter.label}
                          size="sm"
                          variant="ghost"
                          isDisabled={!first}
                          aria-pressed={activeChapter === chapter}
                          onPress={() => {
                            setPlaying(false);
                            setTime(first!.playAt);
                          }}
                        >
                          {i + 1}. {chapter.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
                {mode === "replay" && chapters.length > 0 && activeChapter && (
                  <p role="status">
                    {activeChapter.label} · action{" "}
                    {Math.max(1, activeChapter.steps.indexOf(selected) + 1)} of{" "}
                    {activeChapter.steps.length}
                    {" · "}
                    {workflow.nodes.find((n) => n.id === selected)?.label}
                  </p>
                )}
                {mode === "replay" && (
                  <div
                    className="wp-capture-markers"
                    aria-label="Captured frames"
                  >
                    {playback
                      .filter(
                        (c) =>
                          chapters.length === 0 ||
                          activeChapter?.steps.includes(c.stepId),
                      )
                      .map((c, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          size="sm"
                          onPress={() => {
                            setPlaying(false);
                            setTime(c.playAt);
                          }}
                          aria-pressed={
                            playback.filter((f) => f.playAt <= time).at(-1) ===
                            c
                          }
                        >
                          {i + 1}.{" "}
                          {workflow.nodes.find((n) => n.id === c.stepId)?.label}
                          {c.check === "input" ? " · Entered" : ""} ·{" "}
                          {clock(c.at)}
                        </Button>
                      ))}
                  </div>
                )}
                {chapters.length > 0 && recording && (
                  <label>
                    Playback branch{" "}
                    <select
                      aria-label="Playback branch"
                      value={branch}
                      disabled={running}
                      onChange={(e) => {
                        setBranch(e.target.value);
                        setTime(0);
                        setPlaying(false);
                        setMode("replay");
                      }}
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {recording &&
                  (() => {
                    const progress = recordingProgress(recording, workflow);
                    return (
                      <p role="status" className="wp-hint">
                        <strong>
                          {running ? "Recording" : progress.label} ·{" "}
                          {progress.count}/{progress.total} steps captured.
                        </strong>
                        {!progress.complete &&
                          !running &&
                          ` This is not the end of the workflow.${progress.next ? ` Next uncaptured step: ${progress.next}.` : ""} Run it again to capture the complete journey.`}
                      </p>
                    );
                  })()}
                <p className="wp-note">
                  {mode === "live"
                    ? "Live views: perform the action, then capture the step. Captures document the screen; they do not assert a test passed."
                    : `${captures.length} captured frames · Each capture held for review · Original recording ${clock(captures.at(-1)?.at || 0)}. Only captured states are available, not continuous video.`}
                </p>
                {guideState && mode === "live" && (
                  <p role="status">{guideState}</p>
                )}
                {fixture && (
                  <details>
                    <summary>Synthetic test account</summary>
                    <p>
                      {fixture.email} · {fixture.name}
                    </p>
                    <code>{fixture.password}</code>
                  </details>
                )}
                {(error || recording?.error) && (
                  <p role="alert">{error || recording?.error}</p>
                )}
                <div className="wp-bottom">
                  <section className="wp-map">
                    <header className="wp-row">
                      <div>
                        <h3>Workflow map</h3>
                        <small>
                          Forks, nested paths and joins · Click a step to
                          inspect
                        </small>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          aria-label="Zoom out"
                          onPress={() =>
                            setZoom((z) => Math.max(0.35, z - 0.1))
                          }
                        >
                          −
                        </Button>
                        <Button variant="ghost" onPress={() => setZoom(0.8)}>
                          Reset zoom
                        </Button>
                        <Button
                          variant="ghost"
                          aria-label="Zoom in"
                          onPress={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                        >
                          +
                        </Button>
                      </div>
                    </header>
                    <div className="wp-graph-scroll">
                      <div
                        style={{ width: width * zoom, height: height * zoom }}
                      >
                        <div
                          className="wp-graph"
                          style={{ width, height, transform: `scale(${zoom})` }}
                        >
                          <svg width={width} height={height} aria-hidden="true">
                            <defs>
                              <marker
                                id="wp-arrow"
                                markerWidth="8"
                                markerHeight="8"
                                refX="7"
                                refY="3"
                                orient="auto"
                              >
                                <path
                                  d="M0,0 L0,6 L7,3 z"
                                  fill="currentColor"
                                />
                              </marker>
                            </defs>
                            {workflow.edges.map(([a, b]) => {
                              const from = graph.find((n) => n.id === a)!,
                                to = graph.find((n) => n.id === b)!;
                              return (
                                <path
                                  key={a + b}
                                  d={`M${from.x + 155},${from.y + 30} H${from.x + 172} V${to.y + 30} H${to.x}`}
                                  markerEnd="url(#wp-arrow)"
                                />
                              );
                            })}
                          </svg>
                          {graph.map((n) => (
                            <button
                              key={n.id}
                              className={
                                "wp-node " +
                                (selected === n.id ? "selected" : "")
                              }
                              style={{ left: n.x, top: n.y }}
                              disabled={running}
                              onClick={() => select(n.id)}
                              aria-pressed={selected === n.id}
                            >
                              <strong>{n.label}</strong>
                              <small>
                                {captures.some(
                                  (c) => c.stepId === n.id && c.verified,
                                )
                                  ? "Checked"
                                  : captures.some((c) => c.stepId === n.id)
                                    ? "Captured"
                                    : "Not run"}{" "}
                                · {names[n.surface]}
                              </small>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export * from "./targets";
