/**
 * 视频标签信息
 */
export interface VideoTag {
  id: number;
  name: string;
}

/**
 * 视频详细信息
 */
export interface VideoDetail {
  id: number;
  title: string;
  poster: string;
  duration: number;
  postId: number;
  lotteryType: string;
  year: number;
  issueNumber: string;
  tags: VideoTag[];
  hasComments: boolean;
  hasBarrages: boolean;
  hasListening: boolean;
} 