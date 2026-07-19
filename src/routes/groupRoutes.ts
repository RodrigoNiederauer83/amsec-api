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
    updateGroupSettings
} from "../controllers/groupController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import {
    createExclusionSchema,
    createGroupSchema,
    createSuggestionSchema,
    drawQuerySchema,
    groupIdParamSchema,
    listSuggestionsQuerySchema,
    searchGroupsQuerySchema,
    updateGroupSettingsSchema,
    updateSuggestionSchema
} from "../schemas/groupSchemas";

const router = Router();

router.post("/", authMiddleware, validate(createGroupSchema), createGroup);
router.post("/:id/invite", authMiddleware, validate(groupIdParamSchema, "params"), createInvite);
router.get("/invite/:token", authMiddleware, getInvitePreview);
router.post("/invite/:token/join", authMiddleware, joinGroupViaInvite);
router.get("/", authMiddleware, validate(searchGroupsQuerySchema, "query"), searchGroups);
router.get("/:id", authMiddleware, validate(groupIdParamSchema, "params"), getGroupDetail);
router.post(
    "/:id/exclusions",
    authMiddleware,
    validate(groupIdParamSchema, "params"),
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
  deleteExclusion
);
router.post(
  "/:id/draw",
  authMiddleware,
  validate(groupIdParamSchema, "params"),
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
  validate(updateGroupSettingsSchema, "body"),
  updateGroupSettings
);

export default router;