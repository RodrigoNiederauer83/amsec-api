type ExclusionPair = { userAId: number; userBId: number };

export function generateDraw( memberIds: number[], exclusions: ExclusionPair[]): Map<number, number> | null {
  const forbidden = new Map<number, Set<number>>();

  for (const id of memberIds) {
    forbidden.set(id, new Set([id])); // ninguém pode tirar a si mesmo
  }

  for (const { userAId, userBId } of exclusions) {
    forbidden.get(userAId)?.add(userBId);
    forbidden.get(userBId)?.add(userAId);
  }

  const givers = shuffle([...memberIds]);
  const assignment = new Map<number, number>();
  const usedReceivers = new Set<number>();

  function backtrack(index: number): boolean {
    if (index === givers.length) return true;

    const giver = givers[index];
    const candidates = shuffle(
      memberIds.filter(
        (candidate) =>
          !usedReceivers.has(candidate) && !forbidden.get(giver)!.has(candidate)
      )
    );

    for (const receiver of candidates) {
      assignment.set(giver, receiver);
      usedReceivers.add(receiver);

      if (backtrack(index + 1)) return true;

      assignment.delete(giver);
      usedReceivers.delete(receiver);
    }

    return false;
  }

  const success = backtrack(0);
  return success ? assignment : null;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}