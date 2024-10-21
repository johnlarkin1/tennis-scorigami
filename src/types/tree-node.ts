export type TreeNode = {
  name: string;
  children?: TreeNode[];
  attributes?: Record<string, any>;
};
