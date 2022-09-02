import { Profile } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { CreatePostBaseSchema } from "./posts.schema"

import { getPosts, getPost, createPost, updatePost, reaction, deletePost } from "./posts.service"

export async function getPostsHandler() {
  // Get all posts in chron order
  const posts = await getPosts()
  return posts
}

export async function getPostHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  
  const { id } = request.params
  const post = await getPost(id)

  if (!post) {
    const error = new Error("No post with such ID")
    return reply.code(404).send(error)
  }

  return post
}

export async function createPostHandler(
  request: FastifyRequest<{
    Body: CreatePostBaseSchema;
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as Profile
  try {
    const post = await createPost({
      ...request.body,
      owner: name,
    })
    reply.send(post);
    return post
  } catch (error) {
    reply.code(400).send(error);
  }
}

export async function deletePostHandler(request: FastifyRequest<{Params: { id: string }}>, reply: FastifyReply) {
  const { id } = request.params
  const { name } = request.user as Profile
  const post = await getPost(Number(id));

  if (!post) {
    reply.code(404).send("Post not found")
    return
  }

  if (name !== post.author.name) {
    reply.code(403).send("You do not have permission to delete this post")
    return
  }

  try {
    await deletePost(Number(id))
    reply.send(`Post ${id} deleted.`);
  } catch(error) {
    reply.code(500).send(error)
  }
}

export async function updatePostHandler(
  request: FastifyRequest<{
    Params: { id: string },
    Body: CreatePostBaseSchema
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile
  const post = await getPost(Number(id));

  if (!post) {
    reply.code(404).send("Post not found")
    return
  }

  if (name !== post.owner) {
    reply.code(403).send("You do not have permission to edit this post")
    return
  }

  try {
    const updatedPost = await updatePost(Number(id), request.body)
    reply.send(updatedPost);
    return updatedPost
  } catch(error) {
    reply.code(500).send(error)
  }
}

export async function reactionHandler(request: FastifyRequest<{
  Params: { id: string, symbol: string }
}>,
reply: FastifyReply
) {
const { id, symbol } = request.params
try {
  const result = await reaction(Number(id), symbol)
  reply.send(result);
  return result
} catch(error) {
  reply.code(500).send(error)
}
}