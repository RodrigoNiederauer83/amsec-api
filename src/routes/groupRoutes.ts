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
    getMyAssignment
} from "../controllers/groupController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import {
    createExclusionSchema,
    createGroupSchema,
    drawQuerySchema,
    groupIdParamSchema,
    searchGroupsQuerySchema
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

export default router;