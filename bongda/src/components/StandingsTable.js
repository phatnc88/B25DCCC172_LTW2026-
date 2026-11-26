import { formatDiff } from '../data';

export const StandingsTable = ({ standings }) => {
  return (
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
          {standings.map((team, idx) => {
            const isLast = idx === standings.length - 1;
            return (
              <tr key={team.id} className={isLast ? 'last-place' : ''}>
                <td>{idx + 1}</td>
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
  );
};