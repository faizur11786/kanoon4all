import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { Fragment } from "react";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { getAuth } from "@/actions/auth/user";
import { redirect } from "next/navigation";
import PageClient from "./page.client";
import { searchParamsCache } from "./_lib/validations";
import { SearchParams } from "nuqs";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page(props: PageProps) {
  const auth = await getAuth();

  if (!auth?.user) {
    return redirect("/sign-in");
  }

  const searchParams = await props.searchParams;

  const { email, page, limit, status } = searchParamsCache.parse(searchParams);

  const { docs, totalPages } = await auth.payload.find({
    collection: "applications",
    overrideAccess: false,
    user: auth.user,
    limit,
    page,
    where: {
      ...(email ? { email: { like: email } } : {}),
      ...(status ? { status: { in: status.split(",") } } : {}),
    },
  });

  return (
    <Fragment>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Applications</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-col gap-4 p-4 pt-0">
        <div className="flex-1 rounded-xl bg-muted/50 p-6 overflow-hidden relative">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Your Applications
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and track your legal case applications. View status
              updates, hearing dates, and document submissions.
            </p>
          </div>
          <FlickeringGrid
            className="absolute right-0 top-0 h-full w-1/3 rotate-12"
            squareSize={20}
            gridGap={6}
            color="#e6ba0a"
            maxOpacity={0.1}
            flickerChance={0.1}
            height={200}
          />
        </div>
        <div>
          <PageClient docs={docs} pageCount={totalPages} />
        </div>
      </div>
    </Fragment>
  );
}
