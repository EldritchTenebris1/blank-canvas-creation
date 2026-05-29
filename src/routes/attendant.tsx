import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/attendant')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/attendant"!</div>
}
