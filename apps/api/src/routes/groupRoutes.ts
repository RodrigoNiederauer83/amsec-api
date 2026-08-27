import { Router } from "express";
import {
    createExclusion,
    createGroup,
    createInvite,
    deleteExclusion,
    drawGroup,
    getGroupDetail,
    getInvitePreview,
    joinGroupViaInvite,
    listExclusions,
    searchGroups,
    getMyAssignment,
    createSuggestion,
    listSuggestions,
    updateSuggestion,
    deleteSuggestion,
    updateGroupSettings,
    deleteGroup,
    transferOwnership,
    leaveGroup,
    removeMember,
    createDependent,
    deleteDependent
} from "../controllers/groupController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import {
  createDependentSchema,
    createExclusionSchema,
    createGroupSchema,
    createSuggestionSchema,
    drawQuerySchema,
    getAssignmentQuerySchema,
    groupIdParamSchema,
    groupMemberParamsSchema,
    listSuggestionsQuerySchema,
    searchGroupsQuerySchema,
    transferOwnershipSchema,
    updateGroupSettingsSchema,
    updateSuggestionSchema
} from "@amsec/shared";
import { loadGroup } from "../middlewares/loadGroup";

const router = Router();

router.post("/", authMiddleware, validate(createGroupSchema), createGroup);
router.post("/:id/invite", authMiddleware, validate(groupIdParamSchema, "params"), loadGroup, createInvite);
router.get("/invite/:token", authMiddleware, getInvitePreview);
router.post("/invite/:token/join", authMiddleware, joinGroupViaInvite);
router.get("/", authMiddleware, validate(searchGroupsQuerySchema, "query"), searchGroups);
router.get("/:id", authMiddleware, validate(groupIdParamSchema, "params"), getGroupDetail);
router.post(
    "/:id/exclusions",
    authMiddleware,
    validate(groupIdParamSchema, "params"),
    loadGroup,
    validate(createExclusionSchema, "body"),
    createExclusion
);
router.get(
    "/:id/exclusions",
    authMiddleware,
    validate(groupIdParamSchema, "params"),
    listExclusions
);
router.delete(
  "/:id/exclusions/:exclusionId",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  loadGroup,
  deleteExclusion
);
router.post(
  "/:id/draw",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  loadGroup,
  validate(drawQuerySchema, "query"),
  drawGroup
);
router.get("/:id/assignment", authMiddleware, validate(groupIdParamSchema, "params"), getMyAssignment);
router.post(
  "/:id/suggestions",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  validate(createSuggestionSchema, "body"),
  createSuggestion
);
router.get(
  "/:id/suggestions",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  validate(listSuggestionsQuerySchema, "query"),
  listSuggestions
);
router.patch(
  "/:id/suggestions/:suggestionId",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  validate(updateSuggestionSchema, "body"),
  updateSuggestion
);
router.delete(
  "/:id/suggestions/:suggestionId",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  deleteSuggestion
);
router.patch(
  "/:id/settings",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  loadGroup, 
  validate(updateGroupSettingsSchema, "body"),
  updateGroupSettings
);
router.delete("/:id", authMiddleware, validate(groupIdParamSchema, "params"), loadGroup, deleteGroup);
router.patch(
  "/:id/transfer-ownership",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  loadGroup,
  validate(transferOwnershipSchema, "body"),
  transferOwnership
);
router.delete("/:id/members/me", authMiddleware, validate(groupIdParamSchema, "params"), loadGroup, leaveGroup);
router.delete("/:id/members/:userId", authMiddleware, validate(groupMemberParamsSchema, "params"), loadGroup, removeMember);
router.post(
  "/:id/dependents",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  loadGroup,
  validate(createDependentSchema, "body"),
  createDependent
);
router.get(
  "/:id/assignment",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  validate(getAssignmentQuerySchema, "query"),
  getMyAssignment
);
router.delete(
  "/:id/dependents/:dependentId",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
  loadGroup,
  deleteDependent
);

export default router;