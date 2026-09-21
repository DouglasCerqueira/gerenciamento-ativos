export default function AssignmentBadge({ returned }: { returned: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        returned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {returned ? 'Devolvida' : 'Ativa'}
    </span>
  )
}