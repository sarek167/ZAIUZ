from rest_framework.reverse import reverse

class LocationHeaderMixin:
    def get_success_headers(self, data):
        headers = super().get_success_headers(data)
        if 'id' in data:
            headers['Location'] = reverse(f'{self.basename}-detail', args=[data['id']], request=self.request)
        return headers