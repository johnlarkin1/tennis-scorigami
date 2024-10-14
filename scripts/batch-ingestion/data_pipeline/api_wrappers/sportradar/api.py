from typing import Optional

import httpx
from sportradar_tennis_v3 import AuthenticatedClient


class SportradarClient(AuthenticatedClient):
    base_url = "https://api.sportradar.com/tennis/trial/v3"

    def __init__(self, api_key: str, **kwargs):
        super().__init__(base_url=self.base_url, token=api_key, **kwargs)
        self.api_key = api_key
        self._client: Optional[httpx.Client] = None

    def get_httpx_client(self) -> httpx.Client:
        """Get the underlying httpx.Client, constructing a new one if not previously set"""
        if self._client is None:
            # Set headers for Authorization if needed (not applicable here, so we skip that part)
            self._client = httpx.Client(
                base_url=self._base_url,
                cookies=self._cookies,
                headers=self._headers,
                timeout=self._timeout,
                verify=self._verify_ssl,
                follow_redirects=self._follow_redirects,
                params={"api_key": self.api_key},
                **self._httpx_args,
            )
        return self._client

    def request(self, method: str, url: str, **kwargs):
        # Automatically add api_key to the URL parameters
        params = kwargs.get("params", {})
        params["api_key"] = self.api_key
        kwargs["params"] = params
        return self.get_httpx_client().request(method, url, **kwargs)
