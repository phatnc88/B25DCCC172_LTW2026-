import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TEAMS, ROUNDS } from '../data';
import { isValidGoals, getTeamName } from '../utils';
import { addMatch, selectMatches } from '../features/matchesSlice';
import { useNotice } from '../context/NoticeContext';

export const AddMatchForm = () => {
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const showNotice = useNotice();
  const homeSelectRef = useRef(null);

  const [round, setRound] = useState('1');
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [homeGoals, setHomeGoals] = useState('');
  const [awayGoals, setAwayGoals] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!home) {
      newErrors.home = 'Hãy chọn đội nhà';
    }

    if (!away) {
      newErrors.away = 'Hãy chọn đội khách';
    } else if (home && home === away) {
      newErrors.away = 'Hai đội phải khác nhau';
    } else if (home) {
      const hId = Number(home);
      const aId = Number(away);
      const playedBefore = matches.some(
        (m) => (m.home === hId && m.away === aId) || (m.home === aId && m.away === hId)
      );
      if (playedBefore) {
        newErrors.away = 'Hai đội đã đá với nhau rồi';
      }
    }

    const hgNum = homeGoals === '' ? NaN : Number(homeGoals);
    if (!isValidGoals(hgNum)) {
      newErrors.homeGoals = 'Số bàn thắng phải là số nguyên từ 0 đến 20';
    }

    const agNum = awayGoals === '' ? NaN : Number(awayGoals);
    if (!isValidGoals(agNum)) {
      newErrors.awayGoals = 'Số bàn thắng phải là số nguyên từ 0 đến 20';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const homeId = Number(home);
    const awayId = Number(away);
    dispatch(
      addMatch({
        round: Number(round),
        home: homeId,
        away: awayId,
        homeGoals: hgNum,
        awayGoals: agNum,
      })
    );

    showNotice(`Đã thêm trận ${getTeamName(homeId)} - ${getTeamName(awayId)}`);

    setRound('1');
    setHome('');
    setAway('');
    setHomeGoals('');
    setAwayGoals('');
    setErrors({});
    if (homeSelectRef.current) {
      homeSelectRef.current.focus();
    }
  };

  return (
    <section className="section-box">
      <h2>Thêm trận đấu</h2>
      <form onSubmit={handleSubmit} noValidate className="add-form">
        <div className="form-group">
          <label htmlFor="match-round">Vòng</label>
          <select id="match-round" value={round} onChange={(e) => setRound(e.target.value)}>
            {ROUNDS.map((r) => (
              <option key={r} value={r}>
                Vòng {r}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="match-home">Đội nhà</label>
          <select
            id="match-home"
            ref={homeSelectRef}
            value={home}
            onChange={(e) => setHome(e.target.value)}
          >
            <option value="">-- Chọn đội --</option>
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {errors.home && <div role="alert" className="error-msg">{errors.home}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="match-away">Đội khách</label>
          <select id="match-away" value={away} onChange={(e) => setAway(e.target.value)}>
            <option value="">-- Chọn đội --</option>
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {errors.away && <div role="alert" className="error-msg">{errors.away}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="match-home-goals">Bàn thắng đội nhà</label>
          <input
            id="match-home-goals"
            type="number"
            min="0"
            max="20"
            value={homeGoals}
            onChange={(e) => setHomeGoals(e.target.value)}
          />
          {errors.homeGoals && <div role="alert" className="error-msg">{errors.homeGoals}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="match-away-goals">Bàn thắng đội khách</label>
          <input
            id="match-away-goals"
            type="number"
            min="0"
            max="20"
            value={awayGoals}
            onChange={(e) => setAwayGoals(e.target.value)}
          />
          {errors.awayGoals && <div role="alert" className="error-msg">{errors.awayGoals}</div>}
        </div>

        <button type="submit">Thêm trận</button>
      </form>
    </section>
  );
};