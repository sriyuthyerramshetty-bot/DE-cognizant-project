import CalenderContainer from "../components/CalendarPage/CalendarContainer"
import CalendarHeader from "../components/CalendarPage/CalendarHeader"
import TextAsset from "../assets/TextAssets.json"

function CalendarPage() {
  return (
    <>
      <div className="relative flex flex-col px-6 pt-6 pb-3 gap-2">
        <h1 className="text-2xl font-semibold">{TextAsset.CalendarPage.title}</h1>
      </div>

      {/* Calendar Header */}
      <div className="px-6 pb-1.5">
        <CalendarHeader />
      </div>

      {/* Calendar Container */}
      <div className="px-6 pb-2 h-[calc(100vh-9.5rem)]">
        <CalenderContainer />
      </div>
    </>
  )
}

export default CalendarPage