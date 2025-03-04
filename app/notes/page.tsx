"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { posts } from "#site/content";
import { PostItemBox } from "@/components/post-item-box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import TagError from "@/components/TagError";
import BlurFade from "@/components/ui/blur-fade";
import { NotesSearch } from "@/components/NotesSearch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const QueryPagination = dynamic(
  () =>
    import("@/components/query-pagination").then((mod) => mod.QueryPagination),
  { ssr: false }
);

const POSTS_PER_PAGE = 6;

function NotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedUniversity, setSelectedUniversity] = useState<string>(
    searchParams.get("university") || ""
  );
  const [selectedDegree, setSelectedDegree] = useState<string>(
    searchParams.get("degree") || ""
  );
  const [selectedSemester, setSelectedSemester] = useState<string>(
    searchParams.get("semester") || ""
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    searchParams.get("subject") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedUniversity) params.set("university", selectedUniversity);
    if (selectedDegree) params.set("degree", selectedDegree);
    if (selectedSemester) params.set("semester", selectedSemester);
    if (selectedSubject) params.set("subject", selectedSubject);
    params.set("page", currentPage.toString());

    const newUrl = `?${params.toString()}`;
    router.replace(newUrl); // Replace without a full refresh
  }, [
    selectedUniversity,
    selectedDegree,
    selectedSemester,
    selectedSubject,
    currentPage,
    router,
  ]);

  const universities = Array.from(
    new Set(posts.map((post) => post.metadata?.university).filter(Boolean))
  );
  const degrees = Array.from(
    new Set(
      posts
        .filter((post) => post.metadata?.university === selectedUniversity)
        .map((post) => post.metadata?.degree)
        .filter(Boolean)
    )
  );
  const semesters = Array.from(
    new Set(
      posts
        .filter(
          (post) =>
            post.metadata?.university === selectedUniversity &&
            post.metadata?.degree === selectedDegree
        )
        .map((post) => post.metadata?.semester)
        .filter(Boolean)
    )
  );
  const subjects = Array.from(
    new Set(
      posts
        .filter(
          (post) =>
            post.metadata?.university === selectedUniversity &&
            post.metadata?.degree === selectedDegree &&
            post.metadata?.semester === selectedSemester
        )
        .map((post) => post.metadata?.subject)
        .filter(Boolean)
    )
  );

  const filteredPosts = posts.filter((post) => {
    return (
      post.published &&
      !post.excludeFromMain &&
      (!selectedUniversity ||
        post.metadata?.university === selectedUniversity) &&
      (!selectedDegree || post.metadata?.degree === selectedDegree) &&
      (!selectedSemester || post.metadata?.semester === selectedSemester) &&
      (!selectedSubject || post.metadata?.subject === selectedSubject)
    );
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const displayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (currentPage - 1),
    POSTS_PER_PAGE * currentPage
  );

  return (
    <div className="container max-w-4xl py-6 lg:py-10 font-wotfard">
      <React.Suspense fallback={<div>Loading...</div>}>
        <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
          <div className="flex-1 space-y-4">
            <h1 className="text-[2.3rem] lg:text-[4.5rem] md:text-[4rem] leading-[1] font-bold dark:bg-gradient-to-b dark:from-[rgba(244,244,255,1)] dark:to-[rgba(181,180,207,1)] dark:text-transparent dark:bg-clip-text py-2 text-center">
              Welcome to Notes Buddy!
            </h1>
            <p className="text-xl text-center text-muted-foreground">
              Your exams last moment notes are here!
            </p>
            <NotesSearch DropBox={true} />
          </div>
        </div>
      </React.Suspense>
      <Card className="my-10">
        <CardHeader>
          <CardTitle className="font-gilroy">Search By :</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row gap-4 items-center justify-center">
          <div className="flex flex-col md:flex-row gap-4 w-3/4 font-gilroy font-bold text-pretty tracking-wide dark:text-[#dbdbdb]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>{selectedUniversity || "Select University"}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {universities.map((uni) => (
                  <DropdownMenuItem
                    key={uni}
                    onClick={() => {
                      setSelectedUniversity(uni!);
                      setSelectedDegree("");
                      setSelectedSemester("");
                      setSelectedSubject("");
                    }}
                  >
                    {uni}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={!selectedUniversity}>
                  {selectedDegree || "Select Degree"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {degrees.map((deg) => (
                  <DropdownMenuItem
                    key={deg}
                    onClick={() => {
                      setSelectedDegree(deg!);
                      setSelectedSemester("");
                      setSelectedSubject("");
                    }}
                  >
                    {deg}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={!selectedDegree}>
                  {selectedSemester || "Select Semester"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {semesters.sort().map((sem) => (
                  <DropdownMenuItem
                    key={sem}
                    onClick={() => {
                      setSelectedSemester(sem!);
                      setSelectedSubject("");
                    }}
                  >
                    {sem}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={!selectedSemester}>
                  {selectedSubject || "Select Subject"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {subjects.map((sub) => (
                  <DropdownMenuItem
                    key={sub}
                    onClick={() => setSelectedSubject(sub!)}
                  >
                    {sub}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4">
        <hr />
        {displayPosts.length > 0 ? (
          <ul className="gap-4 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {displayPosts.map((post) => {
              const { slug, title, description, tags } = post;
              return (
                <li
                  key={slug}
                  className="border border-border rounded-xl dark:border-0"
                >
                  <BlurFade delay={0.1} inView>
                    <PostItemBox
                      slug={slug}
                      title={title}
                      description={description}
                      tags={tags}
                    />
                  </BlurFade>
                </li>
              );
            })}
          </ul>
        ) : (
          <TagError />
        )}
        <QueryPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          className="justify-end mt-4"
        />
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotesContent />
    </Suspense>
  );
}
