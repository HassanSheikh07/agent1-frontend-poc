/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export const FRONTEND_USER = {
  id: 'frontend-user',
  name: 'Frontend User',
  role: 'user'
}

export function isFrontendUserActivity(activity: any): boolean {
  return activity?.from?.id === FRONTEND_USER.id
}

export function createUserMessageActivity(text: string, extra: Record<string, any> = {}): any {
  return {
    type: 'message',
    from: FRONTEND_USER,
    text,
    textFormat: 'plain',
    locale: 'en-US',
    ...extra
  }
}


export function postActivity(connection: any, activity: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      connection.postActivity(activity).subscribe(
        (id: string) => resolve(id),
        (error: any) => reject(error)
      )
    } catch (error) {
      reject(error)
    }
  })
}
