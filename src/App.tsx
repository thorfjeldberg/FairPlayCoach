import { useFairPlay } from './logic/useFairPlay';
import { SetupView } from './components/SetupView';
import { MatchView } from './components/MatchView';
import { ReportView } from './components/ReportView';

function App() {
  const {
    state,
    addPlayer,
    removePlayer,
    updateSettings,
    startMatch,
    pauseMatch,
    resetMatch,
    finishMatch,
    setPlayerStatus,
    addGoal,
    addOpponentGoal,
    performSubstitution,
    suggestedInterval
  } = useFairPlay();

  let content;
  if (state.match.status === 'IDLE') {
    content = (
      <SetupView
        players={state.players}
        settings={state.settings}
        suggestedInterval={suggestedInterval}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onUpdateSettings={updateSettings}
        onStartMatch={startMatch}
        onSetStatus={setPlayerStatus}
      />
    );
  } else if (state.match.status === 'FINISHED') {
    content = (
      <ReportView
        players={state.players}
        goals={state.goals}
        opponentScore={state.match.opponentScore}
        onReset={resetMatch}
      />
    );
  } else {
    content = (
      <MatchView
        match={state.match}
        players={state.players}
        settings={state.settings}
        goals={state.goals}
        onPause={pauseMatch}
        onResume={startMatch}
        onEndMatch={finishMatch}
        onGoal={addGoal}
        onOpponentGoal={addOpponentGoal}
        onPerformSub={performSubstitution}
        onManualSub={(pid, status) => setPlayerStatus(pid, status)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-black/20">
        {content}
      </div>
    </div>
  );
}

export default App;
