interface StatDef {
  id: string
  key: string
  label: string
}

interface StatValue {
  definition_id: string
  team: 'ger' | 'rival'
  value: string
}

interface SixFiveStat {
  team: 'ger' | 'rival'
  phase: '6v5' | '5v6'
  intentos: number
  goles: number
}

interface Props {
  definitions: StatDef[]
  values: StatValue[]
  sixFive: SixFiveStat[]
  rivalName?: string
}

export function MatchStats({ definitions, values, sixFive, rivalName }: Props) {
  const valMap = new Map<string, string>()
  for (const v of values) {
    valMap.set(`${v.definition_id}:${v.team}`, v.value)
  }

  const sixFiveMap = new Map<string, SixFiveStat>()
  for (const s of sixFive) {
    sixFiveMap.set(`${s.team}:${s.phase}`, s)
  }

  const ger65 = sixFiveMap.get('ger:6v5')
  const ger56 = sixFiveMap.get('ger:5v6')
  const rival65 = sixFiveMap.get('rival:6v5')
  const rival56 = sixFiveMap.get('rival:5v6')

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="bg-blue-800 text-white px-4 py-3">
        <h3 className="font-semibold text-lg">Estadísticas del Partido</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Métrica</th>
              <th className="text-center px-4 py-2 font-medium text-blue-800">GER</th>
              <th className="text-center px-4 py-2 font-medium text-gray-600">{rivalName || 'Rival'}</th>
            </tr>
          </thead>
          <tbody>
            {definitions.map(d => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{d.label}</td>
                <td className="text-center px-4 py-2 font-mono">{valMap.get(`${d.id}:ger`) || '-'}</td>
                <td className="text-center px-4 py-2 font-mono">{valMap.get(`${d.id}:rival`) || '-'}</td>
              </tr>
            ))}
            {ger65 && (
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">6v5 a favor</td>
                <td className="text-center px-4 py-2 font-mono">
                  {ger65.goles}/{ger65.intentos}{' '}
                  ({ger65.intentos > 0 ? Math.round((ger65.goles / ger65.intentos) * 100) : 'N/A'}%)
                </td>
                <td className="text-center px-4 py-2 font-mono">
                  {rival56 ? `${rival56.goles}/${rival56.intentos}` : '-'}
                </td>
              </tr>
            )}
            {ger56 && (
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">5v6 en contra</td>
                <td className="text-center px-4 py-2 font-mono">
                  {ger56.goles}/{ger56.intentos}{' '}
                  ({ger56.intentos > 0 ? Math.round((ger56.goles / ger56.intentos) * 100) : 'N/A'}%)
                </td>
                <td className="text-center px-4 py-2 font-mono">
                  {rival65 ? `${rival65.goles}/${rival65.intentos}` : '-'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
