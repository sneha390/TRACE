import ChannelAnalysis from './channelAnalysis'
import RedditDrugPostsAnalysis from './reddit'
import logo from 'assets/trace-high-resolution-logo-transparent.png'

const randoms = [
  [1, 2],
  [3, 4, 5],
  [6, 7]
]

function App() {
  return (
   <div className='font-[Poppins] bg-gradient-to-t from-[#fbc2eb] to-[#a6c1ee] h-screen'>
     <header className="bg-white">
        <nav className="flex justify-between items-center w-[92%]  mx-auto p-4 ">
            <div>
                <img className="w-16 cursor-pointer" src={logo} alt="..."></img>
            </div>
            <div
                className="nav-links duration-500 md:static absolute bg-white md:min-h-fit min-h-[60vh] left-0 top-[-100%] md:w-auto  w-full flex items-center px-5">

            </div>

          </nav>
    </header>
    <RedditDrugPostsAnalysis></RedditDrugPostsAnalysis>
    <ChannelAnalysis></ChannelAnalysis>
   </div>
  )
}

export default App
