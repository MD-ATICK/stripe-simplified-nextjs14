import { v } from "convex/values";
import { query } from "./_generated/server";


export const getCourses = query({
    args : {},
    handler : async (ctx) => {
        const courses = await ctx.db.query('courses').collect();
        return courses;
    }
})

export const getCourseById = query({
    args : { courseId : v.id('courses') },
    handler : async (ctx, args) => {
        const course = await ctx.db.get(args.courseId)
        return course;
    }
})