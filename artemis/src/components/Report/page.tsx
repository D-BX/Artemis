import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Report",
  description: "This is a generated credit report",

};


export default function Report() {
    return(
        <>
            <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
                <div className="container">
                    <div className="-mx-4 flex flex-wrap">
                        <div className="w-full px-4">
                            <div className="mx-auto max-w-[800px] rounded bg-red-500 px-6 py-10 shadow-three sm:p-[60px]">
                                <h3 className="mb-3 text-center text-2xl font-bold text-white sm:text-3xl">
                                    Your Heading Here
                                </h3>
                                <p className="text-center text-white">
                                    This is some sample content inside the wider red card.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </>
    )
}