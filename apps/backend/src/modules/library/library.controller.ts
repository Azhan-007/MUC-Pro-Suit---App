import { FastifyReply, FastifyRequest } from 'fastify';
import { LibraryService } from './library.service';
import { z } from 'zod';

export class LibraryController {
  static async issue(req: FastifyRequest, reply: FastifyReply) {
    const { memberId, bookCopyId } = z.object({ memberId: z.string().uuid(), bookCopyId: z.string().uuid() }).parse(req.body);
    const loan = await LibraryService.issueBook(memberId, bookCopyId, req.user.userId);
    return reply.send({ success: true, loan });
  }
  static async returnBook(req: FastifyRequest, reply: FastifyReply) {
    const { loanId } = z.object({ loanId: z.string().uuid() }).parse(req.body);
    await LibraryService.returnBook(loanId, req.user.userId);
    return reply.send({ success: true });
  }
  static async renew(req: FastifyRequest, reply: FastifyReply) {
    const { loanId } = z.object({ loanId: z.string().uuid() }).parse(req.body);
    const renewal = await LibraryService.renewBook(loanId, req.user.userId);
    return reply.send({ success: true, renewal });
  }

  static async getAllBooks(req: FastifyRequest, reply: FastifyReply) {
    const data = await LibraryService.getAllBooks();
    return reply.send({ success: true, data });
  }

  static async getAllCopys(req: FastifyRequest, reply: FastifyReply) {
    const data = await LibraryService.getAllCopys();
    return reply.send({ success: true, data });
  }

  static async getAllMembers(req: FastifyRequest, reply: FastifyReply) {
    const data = await LibraryService.getAllMembers();
    return reply.send({ success: true, data });
  }

  static async getAllLoans(req: FastifyRequest, reply: FastifyReply) {
    const data = await LibraryService.getAllLoans();
    return reply.send({ success: true, data });
  }

  static async getAllReservations(req: FastifyRequest, reply: FastifyReply) {
    const data = await LibraryService.getAllReservations();
    return reply.send({ success: true, data });
  }

  static async getAllResolutionRecords(req: FastifyRequest, reply: FastifyReply) {
    const data = await LibraryService.getAllResolutionRecords();
    return reply.send({ success: true, data });
  }
}
