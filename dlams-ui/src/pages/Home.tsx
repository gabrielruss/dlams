import useAuth from "@/stores/auth"

function Home() {
  const { user } = useAuth()

  return <div>You freaking did it {user?.username}</div>
}

export default Home
