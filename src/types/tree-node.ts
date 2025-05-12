export type TreeNode = {
  name: string;
  children?: TreeNode[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: Record<string, any>; // TODO: fix this
};
