import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Pagination() {
  return (
    <div className="flex items-center justify-center mt-12">
      <div className="flex items-center gap-1">
        <Link href="#" className="flex items-center justify-center w-8 h-8 rounded-md border">
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <Link href="#" className="flex items-center justify-center w-8 h-8 rounded-md bg-red-800 text-white">
          1
        </Link>

        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
          <Link
            key={page}
            href="#"
            className="flex items-center justify-center w-8 h-8 rounded-md border hover:bg-gray-50"
          >
            {page}
          </Link>
        ))}

        <Link href="#" className="flex items-center justify-center w-8 h-8 rounded-md border">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
