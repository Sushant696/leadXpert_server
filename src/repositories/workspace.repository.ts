import { ClientSession, Types } from "mongoose";

import {
  IWorkspace,
  Workspace,
  WorkspaceDocument,
} from "../models/workspace.model";
import { WorkspaceType } from "../types/workspace.types";
import ApiError from "../exceptions/apiError";
import { StatusCodes } from "http-status-codes";

interface IWorkspaceRepository {
  createWorkspace(
    workspaceData: Partial<IWorkspace>,
    session: ClientSession,
  ): Promise<WorkspaceDocument>;
  updateWorkspaceById(
    workspaceId: string,
    workspaceData: Partial<WorkspaceType>,
  ): Promise<WorkspaceDocument | null>;
  findWorkspaceOfUserByName(
    name: string,
    userId: string,
  ): Promise<WorkspaceDocument | null>;
  addMemberToWorkspace(
    workspaceId: string,
    userId: string,
    session: ClientSession,
  ): Promise<WorkspaceDocument | null>;
  findWorkspaceByWorkspaceAndOwnerId(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceDocument | null>;
  findWorkspaceById(workspaceId: string): Promise<WorkspaceDocument | null>;
  deleteWorkspaceById(
    workspaceId: string,
    session: ClientSession,
  ): Promise<void>;
  findAllMembersOfWorkspace(workspaceId: string): Promise<any>;
  removeMemberFromWorkspace(
    workspaceId: string,
    membershipId: string,
    session: ClientSession,
  ): Promise<WorkspaceDocument | null>;
}

class WorkspaceRepository implements IWorkspaceRepository {
  async createWorkspace(
    workspaceData: Partial<IWorkspace>,
    session: ClientSession,
  ): Promise<WorkspaceDocument> {
    const workspace = await Workspace.create([workspaceData], { session });
    return workspace[0];
  }

  async findWorkspaceById(
    workspaceId: string,
  ): Promise<WorkspaceDocument | null> {
    const workspace = await Workspace.findById(workspaceId);
    return workspace;
  }

  async updateWorkspaceById(
    workspaceId: string,
    workspaceData: Partial<WorkspaceType>,
  ): Promise<WorkspaceDocument | null> {
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      workspaceData,
      { new: true },
    );
    return workspace;
  }

  // find workspace by name with same user id
  async findWorkspaceOfUserByName(
    name: string,
    userId: string,
  ): Promise<WorkspaceDocument | null> {
    return await Workspace.findOne({
      name,
      owner: new Types.ObjectId(userId),
    });
  }

  // find workspace by workspaceId and userId
  async findWorkspaceByWorkspaceAndOwnerId(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceDocument | null> {
    return await Workspace.findOne({
      _id: new Types.ObjectId(workspaceId),
      owner: new Types.ObjectId(userId),
    });
  }

  async deleteWorkspaceById(
    workspaceId: string,
    session: ClientSession,
  ): Promise<void> {
    await Workspace.deleteOne({ _id: workspaceId }, { session });
    return;
  }

  async addMemberToWorkspace(
    workspaceId: string,
    membershipId: string,
    session: ClientSession,
  ): Promise<WorkspaceDocument | null> {
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { $addToSet: { members: new Types.ObjectId(membershipId) } },
      { new: true, session },
    );
    return workspace;
  }

  async findAllMembersOfWorkspace(workspaceId: string) {
    const workspaceMembers = await Workspace.aggregate([
      { $match: { _id: new Types.ObjectId(workspaceId) } },
      {
        $lookup: {
          from: "memberships",
          localField: "members",
          foreignField: "_id",
          as: "memberDetails",
        },
      },
      { $unwind: "$memberDetails" },
      {
        $lookup: {
          from: "users",
          localField: "memberDetails.userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          members: {
            $push: {
              role: "$memberDetails.role",
              membershipId: "$memberDetails._id",
              joinedAt: "$memberDetails.createdAt",
              workspaceId: "$memberDetails.workspaceId",
              user: {
                id: "$userData._id",
                name: "$userData.name",
                email: "$userData.email",
                profilePicture: "$userData.profilePicture",
              },
            },
          },
        },
      },
    ]);
    return workspaceMembers;
  }

  async removeMemberFromWorkspace(
    workspaceId: string,
    membershipId: string,
    session: ClientSession,
  ) {
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      // pulling out the occurance of the membership id from the members field of workspace doc
      { $pull: { members: new Types.ObjectId(membershipId) } },
      { new: true, session },
    );
    if (!workspace) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Workspace ${workspaceId} not found`);
    }
    return workspace;
  }

  async getDashboardStats(workspaceId: string) {
    const Lead = (await import("../models/lead.model")).Lead;
    const Deal = (await import("../models/deal.model")).Deal;
    const Task = (await import("../models/task.model")).Task;
    const Activity = (await import("../models/activity.model")).Activity;

    const workspaceObjectId = new Types.ObjectId(workspaceId);
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    // Aggregate all stats in parallel
    const [leadStats, dealStats, taskStats, recentActivities] = await Promise.all([
      // Lead statistics
      Lead.aggregate([
        { $match: { workspaceId: workspaceObjectId } },
        {
          $facet: {
            total: [{ $count: "count" }],
            byStatus: [
              { $group: { _id: "$status", count: { $sum: 1 } } },
            ],
            byPriority: [
              { $group: { _id: "$priority", count: { $sum: 1 } } },
            ],
          },
        },
      ]),

      // Deal statistics
      Deal.aggregate([
        { $match: { workspaceId: workspaceObjectId } },
        {
          $facet: {
            total: [{ $count: "count" }],
            byStatus: [
              { $group: { _id: "$status", count: { $sum: 1 } } },
            ],
            totalValue: [
              { $group: { _id: null, total: { $sum: "$value" } } },
            ],
          },
        },
      ]),

      // Task statistics
      Task.aggregate([
        { $match: { workspaceId: workspaceObjectId } },
        {
          $facet: {
            total: [{ $count: "count" }],
            byStatus: [
              { $group: { _id: "$status", count: { $sum: 1 } } },
            ],
            byPriority: [
              { $group: { _id: "$priority", count: { $sum: 1 } } },
            ],
            dueToday: [
              {
                $match: {
                  dueDate: { $gte: startOfToday, $lte: endOfToday },
                  status: { $nin: ["COMPLETED", "CANCELLED"] },
                },
              },
              { $count: "count" },
            ],
            overdue: [
              {
                $match: {
                  dueDate: { $lt: startOfToday },
                  status: { $nin: ["COMPLETED", "CANCELLED"] },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),

      // Recent activities (last 15)
      Activity.aggregate([
        { $match: { workspaceId: workspaceObjectId } },
        { $sort: { createdAt: -1 } },
        { $limit: 15 },
        {
          $lookup: {
            from: "users",
            localField: "performedBy",
            foreignField: "_id",
            as: "performedByData",
          },
        },
        {
          $unwind: {
            path: "$performedByData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            type: 1,
            description: 1,
            entityType: 1,
            entityId: 1,
            createdAt: 1,
            performedBy: {
              _id: "$performedByData._id",
              name: "$performedByData.name",
              email: "$performedByData.email",
              profilePicture: "$performedByData.profilePicture",
            },
          },
        },
      ]),
    ]);

    // Format the results
    const leadData = leadStats[0];
    const dealData = dealStats[0];
    const taskData = taskStats[0];

    const formatGroupBy = (arr: Array<{ _id: string; count: number }>) => {
      return arr.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>);
    };

    return {
      leads: {
        total: leadData.total[0]?.count || 0,
        byStatus: formatGroupBy(leadData.byStatus),
        byPriority: formatGroupBy(leadData.byPriority),
      },
      deals: {
        total: dealData.total[0]?.count || 0,
        byStatus: formatGroupBy(dealData.byStatus),
        totalValue: dealData.totalValue[0]?.total || 0,
      },
      tasks: {
        total: taskData.total[0]?.count || 0,
        byStatus: formatGroupBy(taskData.byStatus),
        byPriority: formatGroupBy(taskData.byPriority),
        dueToday: taskData.dueToday[0]?.count || 0,
        overdue: taskData.overdue[0]?.count || 0,
      },
      recentActivities,
      conversionRate:
        leadData.total[0]?.count > 0
          ? ((dealData.total[0]?.count || 0) / leadData.total[0].count) * 100
          : 0,
    };
  }
}

export default WorkspaceRepository;
