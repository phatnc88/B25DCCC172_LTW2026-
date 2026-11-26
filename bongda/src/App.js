import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { TEAMS, ROUNDS, RESULT_LABELS, formatDiff } from './data';
import { getTeamName, getResult, isValidGoals, calcStandings, calcMatchStats } from './utils';
import { matchesReducer } from './matchesReducer';
import { useFetch } from './hooks/useFetch';

function App() {
  const { data, loading, error } = useFetch('/data/matches.json');
  const [matches, dispatch] = useReducer(matchesReducer, []);
  const [selectedRound, setSelectedRound] = useState('all');

  const [round, setRound] = useState('1');
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [homeGoals, setHomeGoals] = useState('');
  const [awayGoals, setAwayGoals] = useState('');
  const [errors, setErrors] = useState({});

  const homeSelectRef = useRef(null);

  useEffect(() => {
    if (data) {
      dispatch({ type: 'LOAD', payload: data });
    }
  }, [data]);

  const standings = useMemo(() => calcStandings(matches), [matches]);

  const filteredMatches = useMemo(() => {
    if (selectedRound === 'all') return matches;
    return matches.filter((m) => m.round === Number(selectedRound));
  }, [matches, selectedRound]);

  const stats = useMemo(() => calcMatchStats(filteredMatches), [filteredMatches]);

  const leader = matches.length > 0 ? standings[0] : null;

  const handleGoalsChange = (id, currentHomeGoals, currentAwayGoals, side, e) => {
    const val = e.target.valueAsNumber;
    if (!isValidGoals(val)) return;

    const nextHomeGoals = side === 'home' ? val : currentHomeGoals;
    const nextAwayGoals = side === 'away' ? val : currentAwayGoals;

    dispatch({
      type: 'SET_GOALS',
      payload: { id, homeGoals: nextHomeGoals, awayGoals: nextAwayGoals },
    });
  };

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE', payload: id });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!home) {
      nextErrors.home = 'Hãy chọn đội nhà';
    }

    if (!away) {
      nextErrors.away = 'Hãy chọn đội khách';
    } else if (home && home === away) {
      nextErrors.away = 'Hai đội phải khác nhau';
    } else if (home) {
      const hId = Number(home);
      const aId = Number(away);
      const alreadyPlayed = matches.some(
        (m) => (m.home === hId && m.away === aId) || (m.home === aId && m.away === hId)
      );
      if (alreadyPlayed) {
        nextErrors.away = 'Hai đội đã đá với nhau rồi';
      }
    }

    const hgNum = homeGoals === '' ? NaN : Number(homeGoals);
    if (!isValidGoals(hgNum)) {
      nextErrors.homeGoals = 'Số bàn thắng phải là số nguyên từ 0 đến 20';
    }

    const agNum = awayGoals === '' ? NaN : Number(awayGoals);
    if (!isValidGoals(agNum)) {
      nextErrors.awayGoals = 'Số bàn thắng phải là số nguyên từ 0 đến 20';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    dispatch({
      type: 'ADD',
      payload: {
        round: Number(round),
        home: Number(home),
        away: Number(away),
        homeGoals: hgNum,
        awayGoals: agNum,
      },
    });

    setRound('1');
    setHome('');
    setAway('');
    setHomeGoals('');
    setAwayGoals('');
    setErrors({});
    homeSelectRef.current?.focus();
  };

  if (loading) {
    return (
      <div className="app">
        <p>Đang tải lịch thi đấu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <p>Không tải được lịch thi đấu</p>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Giải bóng đá khoa</h1>

      <section className="section-box">
        <h2>Bảng xếp hạng</h2>
        <table>
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Đội</th>
              <th>Trận</th>
              <th>Thắng</th>
              <th>Hòa</th>
              <th>Thua</th>
              <th>BT</th>
              <th>BB</th>
              <th>HS</th>
              <th>Điểm</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => {
              const isLast = index === standings.length - 1;
              return (
                <tr key={team.id} className={isLast ? 'last-place' : ''}>
                  <td>{index + 1}</td>
                  <td>{team.name}</td>
                  <td>{team.played}</td>
                  <td>{team.won}</td>
                  <td>{team.drawn}</td>
                  <td>{team.lost}</td>
                  <td>{team.gf}</td>
                  <td>{team.ga}</td>
                  <td>{formatDiff(team.diff)}</td>
                  <td>{team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="section-box">
        <h2>Thống kê</h2>
        <p>Số trận: {stats.count}</p>
        <p>Tổng số bàn thắng: {stats.goals}</p>
        <p>Bàn thắng mỗi trận: {stats.average}</p>
        <p>Đội dẫn đầu: {leader ? `${leader.name} (${leader.points} điểm)` : '-'}</p>
      </section>

      <section className="section-box">
        <h2>Lịch thi đấu</h2>
        <div className="filters">
          <div className="form-group">
            <label htmlFor="filter-round">Xem vòng</label>
            <select
              id="filter-round"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {ROUNDS.map((r) => (
                <option key={r} value={String(r)}>
                  Vòng {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <p>Chưa có trận đấu nào</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vòng</th>
                <th>Đội nhà</th>
                <th>BT nhà</th>
                <th>BT khách</th>
                <th>Đội khách</th>
                <th>Kết quả</th>
                <th>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match) => {
                const homeName = getTeamName(match.home);
                const awayName = getTeamName(match.away);
                const result = getResult(match);
                const isDraw = result === 'draw';

                return (
                  <tr key={match.id} className={isDraw ? 'draw-row' : ''}>
                    <td>Vòng {match.round}</td>
                    <td>{homeName}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        aria-label={`Bàn thắng nhà ${homeName} - ${awayName}`}
                        value={match.homeGoals}
                        onChange={(e) =>
                          handleGoalsChange(
                            match.id,
                            match.homeGoals,
                            match.awayGoals,
                            'home',
                            e
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        aria-label={`Bàn thắng khách ${homeName} - ${awayName}`}
                        value={match.awayGoals}
                        onChange={(e) =>
                          handleGoalsChange(
                            match.id,
                            match.homeGoals,
                            match.awayGoals,
                            'away',
                            e
                          )
                        }
                      />
                    </td>
                    <td>{awayName}</td>
                    <td>{RESULT_LABELS[result]}</td>
                    <td>
                      <button type="button" onClick={() => handleRemove(match.id)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="section-box">
        <h2>Thêm trận đấu</h2>
        <form onSubmit={handleSubmit} noValidate className="add-form">
          <div className="form-group">
            <label htmlFor="add-round">Vòng</label>
            <select
              id="add-round"
              value={round}
              onChange={(e) => setRound(e.target.value)}
            >
              {ROUNDS.map((r) => (
                <option key={r} value={String(r)}>
                  Vòng {r}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="add-home">Đội nhà</label>
            <select
              id="add-home"
              ref={homeSelectRef}
              value={home}
              onChange={(e) => setHome(e.target.value)}
            >
              <option value="">-- Chọn đội --</option>
              {TEAMS.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.home && (
              <div role="alert" className="error-msg">
                {errors.home}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="add-away">Đội khách</label>
            <select
              id="add-away"
              value={away}
              onChange={(e) => setAway(e.target.value)}
            >
              <option value="">-- Chọn đội --</option>
              {TEAMS.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.away && (
              <div role="alert" className="error-msg">
                {errors.away}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="add-home-goals">Bàn thắng đội nhà</label>
            <input
              id="add-home-goals"
              type="number"
              min="0"
              max="20"
              value={homeGoals}
              onChange={(e) => setHomeGoals(e.target.value)}
            />
            {errors.homeGoals && (
              <div role="alert" className="error-msg">
                {errors.homeGoals}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="add-away-goals">Bàn thắng đội khách</label>
            <input
              id="add-away-goals"
              type="number"
              min="0"
              max="20"
              value={awayGoals}
              onChange={(e) => setAwayGoals(e.target.value)}
            />
            {errors.awayGoals && (
              <div role="alert" className="error-msg">
                {errors.awayGoals}
              </div>
            )}
          </div>

          <button type="submit">Thêm trận</button>
        </form>
      </section>
    </div>
  );
}

export default App;