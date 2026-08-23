type AvatarProps = {
  name: string | null;
  avatarUrl: string | null;
  size?: number;
};

export function Avatar({ name, avatarUrl, size = 36 }: AvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() ?? "?";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name ?? "Avatar"}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-primary/10 text-primary font-display font-semibold flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {initial}
    </div>
  );
}