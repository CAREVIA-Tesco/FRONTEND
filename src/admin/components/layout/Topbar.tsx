import { Search, Bell, HelpCircle, ChevronDown } from "lucide-react"

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-surface px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-charcoal placeholder:text-muted focus:ring-0 sm:text-sm bg-transparent outline-none"
            placeholder="Search Carevia..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-muted hover:text-charcoal">
            <span className="sr-only">View notifications</span>
            <div className="relative">
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-error" />
            </div>
          </button>
          <button type="button" className="-m-2.5 p-2.5 text-muted hover:text-charcoal">
            <span className="sr-only">Help</span>
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />
          
          <div className="flex items-center gap-x-2">
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
              SA
            </div>
            <span className="hidden lg:flex lg:items-center">
              <span className="text-sm font-medium leading-6 text-charcoal" aria-hidden="true">
                Super Admin
              </span>
              <ChevronDown className="ml-2 h-4 w-4 text-muted" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
