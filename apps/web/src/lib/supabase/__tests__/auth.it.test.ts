import { describe, it, expect, afterEach, vi, vitest } from "vitest";
import { supabase } from "../client";

describe("supabase integration tests for auth", () => {
  const users: string[] = [];

  afterEach(async () => {
    //clean up
    users.forEach(async (userId) => {
      // TODO deleting from profiles doesn't remove from auth.users
      await supabase.from("profiles").delete().eq("user_id", userId);
    });
  });

  it("Profiles should have the integration test users - trigger is active", async () => {
    // use supabase sign up - creates a row in auth.users
    await supabase.auth.signUp({
      email: "test4@integration.test",
      password: "test4Password",
    });

    await supabase.auth.signInWithPassword({
      email: "test4@integration.test",
      password: "test4Password",
    });

    // trigger should put the new user in the public.profiles table
    const results: any = await supabase
      .from("profiles")
      .select()
      .eq("username", "test4@integration.test");

    users.push(results.data[0].user_id);

    expect(results.data).toEqual([
      {
        created_at: expect.any(String),
        display_name: "test4@integration.test",
        user_id: expect.any(String),
        username: "test4@integration.test",
      },
    ]);
  });
});
